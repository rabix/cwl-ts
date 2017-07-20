import {CWLVersion} from "../../mappings/v1.0/CWLVersion";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {CommandArgumentModel} from "./CommandArgumentModel";
import {CommandInputParameterModel} from "./CommandInputParameterModel";
import {CommandOutputParameterModel} from "./CommandOutputParameterModel";
import {CreateFileRequirementModel} from "./CreateFileRequirementModel";
import {DockerRequirementModel} from "./DockerRequirementModel";
import {ExpressionModel} from "./ExpressionModel";
import {ProcessRequirement} from "./ProcessRequirement";
import {ProcessRequirementModel} from "./ProcessRequirementModel";
import {RequirementBaseModel} from "./RequirementBaseModel";
import {ResourceRequirementModel} from "./ResourceRequirementModel";
import {EventHub} from "../helpers/EventHub";
import {
    fetchByLoc, flatten, incrementLastLoc, incrementString, isEmpty, isType,
    validateID
} from "../helpers/utils";
import {CommandLinePrepare} from "../helpers/CommandLinePrepare";
import {CommandLinePart} from "../helpers/CommandLinePart";
import {JobHelper} from "../helpers/JobHelper";
import {validate} from "jsonschema";

export abstract class CommandLineToolModel extends ValidationBase implements Serializable<any> {
    public id: string;

    public cwlVersion: string | CWLVersion;

    public "class" = "CommandLineTool";

    public sbgId: string;

    public baseCommand: Array<ExpressionModel | string> = [];
    public inputs: CommandInputParameterModel[]         = [];
    public outputs: CommandOutputParameterModel[]       = [];

    public arguments: CommandArgumentModel[] = [];

    public docker: DockerRequirementModel;

    public requirements: Array<ProcessRequirementModel> = [];
    public hints: Array<ProcessRequirementModel>        = [];

    public stdin: ExpressionModel;
    public stdout: ExpressionModel;
    public stderr: ExpressionModel;
    public hasStdErr: boolean;

    public successCodes: number[] = [];
    public temporaryFailCodes: number[] = [];
    public permanentFailCodes: number[] = [];

    public fileRequirement: CreateFileRequirementModel;

    public resources: ResourceRequirementModel;

    public label?: string;
    public description?: string;

    public customProps: any = {};

    public eventHub: EventHub;

    protected jobInputs: any = {};
    protected runtime: any   = {};

    protected constructed: boolean = false;

    protected commandLineWatcher: Function = () => {
    };

    constructor(loc: string) {
        super(loc);

        this.eventHub = new EventHub([
            "input.create",
            "input.remove",
            "input.change",
            "input.change.id",
            "io.change.type",
            "output.create",
            "output.remove",
            "output.change.id",
            "argument.create",
            "argument.remove",
            "field.create",
            "field.remove",
            "validate",
            "binding.shellQuote",
            "expression.serialize"
        ]);
    }

    public on(event: string, handler): { dispose: Function } {
        return {
            dispose: this.eventHub.on(event, handler)
        }
    }

    public off(event: string, handler) {
        this.eventHub.off(event, handler);
    }

    protected getNextAvailableId(id: string, set?: Array<CommandOutputParameterModel | CommandInputParameterModel>) {
        let hasId  = true;
        let result = id;

        set       = set || [...this.outputs, ...this.inputs];
        const len = set.length;

        while (hasId) {
            hasId = false;

            // loop through all inputs and outputs to verify id uniqueness
            for (let i = 0; i < len; i++) {
                if (set[i].id === result) {
                    hasId  = true;
                    // if id exists, increment and check the uniqueness of the incremented id
                    result = incrementString(result);
                }
            }
        }

        return result;
    }

    protected checkIdValidity(id: string, scope?: Array<CommandInputParameterModel | CommandOutputParameterModel>) {
        validateID(id);

        const next = this.getNextAvailableId(id, scope);
        if (next !== id) {
            throw new Error(`ID "${id}" already exists in this tool, the next available id is "${next}"`);
        }
    }

    public changeIOId(port: CommandInputParameterModel | CommandOutputParameterModel, id: string) {
        if (port.id === id) {
            return;
        }

        const oldId = port.id;
        let type;
        let scope;
        // emit set proper type so event can be emitted and validity can be scoped
        if (port instanceof CommandInputParameterModel) {
            type = "input";
        } else if (port instanceof CommandOutputParameterModel) {
            type = "output";
        }

        if (port.isField) {
            scope = this.findFieldParent(port.loc).type.fields;
        }

        // verify that the new ID can be set
        this.checkIdValidity(id, scope);

        port.id = id;
        if (isType(port, ["record", "enum"])) {
            port.type.name = id;
        }

        // emit change event so CLT subclasses can change job values
        this.eventHub.emit(`${type}.change.id`, {port, oldId, newId: port.id});
    }

    protected findFieldRoot(port, base): any {
        // find ancestor that is in the inputs root, save ancestors
        let isField = true;
        // creating a path to the input inside the job, ignoring the id of the actual input for now
        const path  = [];
        // location of the current port we're looking at
        let loc     = port.loc;
        while (isField) {
            const parent = this.findFieldParent(loc);
            // add parent id to the beginning of the path, we're traversing up the tree
            // keeping track if type is array so we can gather all child nodes where port has a value
            path.unshift({id: parent.id, isArray: parent.type.type === "array"});
            // continue traversing if parent is a field
            isField = parent.isField;
            // parent becomes port we're looking at
            loc     = parent.loc;
        }

        // traverse jobInputs with the ids generated from field parents, find root of field
        const traversePath = (path: { id: string, isArray: boolean }[], root: any[]) => {
            // starting from the root of the tree, going down each level till we find the port
            if (path.length === 0) {
                return root;
            }
            // if node is an array, recursively traverse all it's elements
            const part = path[0];

            if (part.isArray) {
                // flatten the nested array, if it contains arrays itself
                return flatten(root[part.id].map(obj => traversePath(path.slice(1), obj)));
            }

            // traverse the path for the root element
            return traversePath(path.slice(1), root[part.id]);
        };

        return traversePath(path, base);
    }

    protected initializeJobWatchers() {
        this.eventHub.on("input.change.id", (data) => {
            let root = this.jobInputs;

            // check if port is a field (nested structure)
            if (data.port.isField) {
                root = this.findFieldRoot(data.port, root);

                if (Array.isArray(root)) {
                    root.forEach(obj => {
                        obj[data.newId] = obj[data.oldId] || JobHelper.generateMockJobData(data.port);
                        delete obj[data.oldId];
                    });
                    return;
                }
            }

            // root is the object which holds changed input, either jobInputs or a record
            root[data.newId] = root[data.oldId] || JobHelper.generateMockJobData(data.port);
            delete root[data.oldId];

            this.updateCommandLine();
        });

        this.eventHub.on("io.change.type", (loc: string) => {
            // make sure loc is within this tree and that belongs to one of the inputs
            if (loc.search(this.loc) === 0 && loc.search("inputs") > -1) {
                // remove root part of loc and ignore type part of loc
                loc                                    = loc.substr(this.loc.length).replace(/type$/, "");
                // find port based on its loc
                const port: CommandInputParameterModel = fetchByLoc(this, loc);
                if (!port) {
                    // newly added inputs will trigger this event before they are added to tool
                    return;
                }
                let root = this.jobInputs;

                if (port.isField) {
                    root = this.findFieldRoot(port, root);

                    if (Array.isArray(root)) {
                        for (let i = 0; i < root.length; i++) {
                            // add mock value of field to each record in array
                            root[i][port.id] = JobHelper.generateMockJobData(port);
                        }

                        this.updateCommandLine();
                        return;
                    }
                }

                root[port.id] = JobHelper.generateMockJobData(port);

                this.updateCommandLine();
            }
        });

        this.eventHub.on("input.remove", (port: CommandInputParameterModel) => {
            delete this.jobInputs[port.id];
            this.updateCommandLine();
        });

        this.eventHub.on("field.remove", (port: CommandInputParameterModel | CommandOutputParameterModel) => {
            if (port instanceof CommandInputParameterModel) {
                const root = this.findFieldRoot(port, this.jobInputs);
                if (Array.isArray(root)) {
                    root.forEach(obj => delete obj[port.id]);
                } else {
                    delete root[port.id];
                }

                this.updateCommandLine();
            }
        });

        this.eventHub.on("input.create", (port: CommandInputParameterModel) => {
            this.jobInputs[port.id] = JobHelper.generateMockJobData(port);
            this.updateCommandLine();
        });

        this.eventHub.on("field.create", (port: CommandInputParameterModel | CommandOutputParameterModel) => {
            if (port instanceof CommandInputParameterModel) {
                let root = this.findFieldRoot(port, this.jobInputs);
                // in case parent is array of records, not a single record
                if (Array.isArray(root)) {
                    for (let i = 0; i < root.length; i++) {
                        // add mock value of field to each record in array
                        root[i][port.id] = JobHelper.generateMockJobData(port);
                    }
                } else {
                    // parent is single record, add mock value of field to that record
                    root[port.id] = JobHelper.generateMockJobData(port);
                }

                this.updateCommandLine();
            }
        });
    }

    public addHint(hint?: ProcessRequirement | any): RequirementBaseModel {
        new UnimplementedMethodException("addHint", "CommandLineToolModel");
        return null;
    }

    public updateStream(stream: ExpressionModel, type: "stderr" | "stdin" | "stdout") {
        new UnimplementedMethodException("updateStream", "CommandLineToolModel");
    }

    protected findFieldParent(loc: string): CommandOutputParameterModel | CommandOutputParameterModel {
        loc = loc.substr(this.loc.length).replace(/\.fields\[\d+]$/, "").replace(/\.type$/, "");
        return fetchByLoc(this, loc);
    }

    _addOutput(outputConstructor, output?) {
        const loc = incrementLastLoc(this.outputs, `${this.loc}.outputs`);
        const id  = this.getNextAvailableId("output");

        if (output) {
            output.id = output.id || id;
        } else {
            output = {id};
        }

        const o = new outputConstructor(output, loc, this.eventHub);

        o.setValidationCallback(err => this.updateValidity(err));

        try {
            this.checkIdValidity(o.id)
        } catch (ex) {
            this.updateValidity({
                [o.loc + ".id"]: {
                    type: "error",
                    message: ex.message
                }
            });
        }

        this.outputs.push(o);
        return o;
    }

    public addOutput(output?): CommandOutputParameterModel {
        new UnimplementedMethodException("addOutput", "CommandLineToolModel");
        return null;
    }

    public removeOutput(output: CommandOutputParameterModel) {
        const index = this.outputs.indexOf(output);
        if (index < 0) {
            return;
        }
        this.outputs[index].cleanValidity();
        this.outputs.splice(index, 1);

        // start at the index and update location of all arguments after it
        for (let i = index; i < this.outputs.length; i++) {
            this.outputs[i].updateLoc(`${this.loc}.outputs[${i}]`);
        }

        this.eventHub.emit("output.remove", output);
    }

    protected _addInput(inputConstructor, input?) {
        const loc = incrementLastLoc(this.inputs, `${this.loc}.inputs`);
        const id  = this.getNextAvailableId("input");

        if (input) {
            input.id = input.id || id;
        } else {
            input = {id};
        }

        const i = new inputConstructor(input, loc, this.eventHub);

        i.setValidationCallback(err => this.updateValidity(err));

        try {
            this.checkIdValidity(i.id)
        } catch (ex) {
            this.updateValidity({
                [i.loc + ".id"]: {
                    type: "error",
                    message: ex.message
                }
            });
        }

        this.inputs.push(i);
        this.eventHub.emit("input.create", i);

        return i;
    }

    public addInput(input?): CommandInputParameterModel {
        new UnimplementedMethodException("addInput", "CommandLineToolModel");
        return null;
    }

    public removeInput(input: CommandInputParameterModel) {
        const index = this.inputs.indexOf(input);
        if (index < 0) {
            return;
        }
        this.inputs[index].cleanValidity();
        this.inputs.splice(index, 1);

        // start at the index and update location of all arguments after it
        for (let i = index; i < this.inputs.length; i++) {
            this.inputs[i].updateLoc(`${this.loc}.inputs[${i}]`);
        }

        this.eventHub.emit("input.remove", input);
    }

    public addArgument(arg?): CommandArgumentModel {
        new UnimplementedMethodException("addArgument", "CommandLineToolModel");
        return null;
    }

    public removeArgument(arg: CommandArgumentModel) {
        const index = this.arguments.indexOf(arg);
        if (index < 0) {
            return;
        }
        this.arguments[index].cleanValidity();
        this.arguments.splice(index, 1);

        // start at the index and update location of all arguments after it
        for (let i = index; i < this.arguments.length; i++) {
            this.arguments[i].updateLoc(`${this.loc}.arguments[${i}]`);
        }

        this.eventHub.emit("argument.remove", arg);
    }

    public addBaseCommand(cmd?): ExpressionModel | void {
        new UnimplementedMethodException("addBaseCommand", "CommandLineToolModel");
        return null;
    }

    public updateCommandLine(): void {
        if (this.constructed) {
            this.generateCommandLineParts().then(res => {
                this.commandLineWatcher(res);
            })
        }
    }

    public setJobInputs(inputs: any): void {
        new UnimplementedMethodException("setJob", "CommandLineToolModel");
    }

    public setRuntime(runtime: any): void {
        new UnimplementedMethodException("setRuntime", "CommandLineToolModel");
    }

    public getContext(input?: any): any {
        new UnimplementedMethodException("getContext", "CommandLineToolModel");
    };

    public resetJobDefaults(): void {
        new UnimplementedMethodException("resetJobDefaults", "CommandLineToolModel");
    }

    public serialize(): any {
        new UnimplementedMethodException("serialize", "CommandLineToolModel");
    }

    public deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize", "CommandLineToolModel");
    }

    public onCommandLineResult(fn: Function) {
        this.commandLineWatcher = fn;
    }

    public setRequirement(req: ProcessRequirement, hint?: boolean) {
        new UnimplementedMethodException("setRequirement", "CommandLineToolModel");
    }

    public generateCommandLine(): Promise<string> {
        return this.generateCommandLineParts().then((parts: CommandLinePart[]) => {
            return parts.filter(p => !!p.value).map(p => p.value).join(" ");
        });
    }

    public generateCommandLineParts(): Promise<CommandLinePart[]> {
        const flatInputs = CommandLinePrepare.flattenInputsAndArgs([].concat(this.arguments).concat(this.inputs));

        const job = isEmpty(this.jobInputs) ? // if job has not been populated
            {...{inputs: JobHelper.getJobInputs(this)}, ...{runtime: this.runtime}} : // supply dummy values
            this.getContext(); // otherwise use job

        const flatJobInputs = CommandLinePrepare.flattenJob(job.inputs || job, {});

        const baseCmdPromise = this.baseCommand.map((cmd, index) => {
            const loc = `${this.loc}.baseCommand[${index}]`;
            return CommandLinePrepare.prepare(cmd, flatJobInputs, this.getContext(), loc, "baseCommand").then(suc => {
                if (suc instanceof CommandLinePart) return suc;
                return new CommandLinePart(<string>suc, "baseCommand", loc);
            }, err => {
                return new CommandLinePart(`<${err.type} at ${err.loc}>`, err.type, loc);
            });
        });

        const inputPromise = flatInputs.map(input => {
            return CommandLinePrepare.prepare(input, flatJobInputs, this.getContext(input), input.loc)
        }).filter(i => i instanceof Promise).map(promise => {
            return promise.then(succ => succ, err => {
                return new CommandLinePart(`<${err.type} at ${err.loc}>`, err.type);
            });
        });

        const stdOutPromise = CommandLinePrepare.prepare(this.stdout, flatJobInputs, this.getContext(), this.stdout.loc, "stdout");
        const stdInPromise  = CommandLinePrepare.prepare(this.stdin, flatJobInputs, this.getContext(), this.stdin.loc, "stdin");

        return Promise.all([].concat(baseCmdPromise, inputPromise, stdOutPromise, stdInPromise)).then((parts: CommandLinePart[]) => {
            return parts.filter(part => part !== null);
        });
    }

    protected checkPortIdUniqueness(): void {
        const map       = {};
        const duplicate = [];
        const ports     = [...this.inputs, ...this.outputs];

        for (let i = 0; i < ports.length; i++) {
            const p = ports[i];

            if (map[p.id]) {
                duplicate.push(p);
            } else {
                map[p.id] = true;
            }
        }

        if (duplicate.length > 0) {
            for (let i = 0; i < duplicate.length; i++) {
                const port = duplicate[i];

                port.updateValidity({
                    [`${port.loc}.id`]: {
                        type: "error",
                        message: `Duplicate id found: “${port.id}”`
                    }
                });
            }
        }
    }
}
