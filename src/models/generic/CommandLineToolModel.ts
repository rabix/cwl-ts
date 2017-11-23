import {CWLVersion} from "../../mappings/v1.0/CWLVersion";
import {CommandLinePart} from "../helpers/CommandLinePart";
import {generateCommandLineParts} from "../helpers/CommandLineUtils";
import {EventHub} from "../helpers/EventHub";
import {JobHelper} from "../helpers/JobHelper";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {
    checkIdValidity,
    fetchByLoc,
    flatten,
    getNextAvailableId,
    incrementLastLoc,
    isType,
} from "../helpers/utils";
import {ErrorCode} from "../helpers/validation/ErrorCode";
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

export abstract class CommandLineToolModel extends ValidationBase implements Serializable<any> {
    // TOOL METADATA //
    public id: string;
    public cwlVersion: string | CWLVersion;
    public "class" = "CommandLineTool";
    public sbgId: string;
    public label?: string;
    public description?: string;

    // CWL PROPERTIES //
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

    public successCodes: number[]       = [];
    public temporaryFailCodes: number[] = [];
    public permanentFailCodes: number[] = [];

    public fileRequirement: CreateFileRequirementModel;

    public resources: ResourceRequirementModel;

    /** Set of all expressions the tool contains */
    private expressions                        = new Set<ExpressionModel>();
    /** Array of all validation processes that are currently occurring */
    private validationPromises: Promise<any>[] = [];

    /** Dummy job.inputs value to be used in command line generation */
    protected jobInputs: any = {};
    /** Dummy job.runtime value to be used in command line generation */
    protected runtime: any   = {};

    // MODEL HELPERS //

    /** Flag to indicate that the tool has finished deserializing */
    protected constructed: boolean = false;
    /** Flag to indicate that tool has stdErr field */
    public hasStdErr: boolean;
    /** Custom properties that weren't serialized */
    public customProps: any        = {};

    /** EventHub that is passed to all children of the tool,
     * used for upward communication in the tool tree */
    public eventHub: EventHub;

    /** Function which is called when the command line is changed */
    protected commandLineWatcher: Function = () => {
    };

    constructor(loc: string) {
        super(loc || "document");

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
            "expression.create",
            "expression.change",
            "expression.serialize",
            "output.metadata.inherit"
        ]);
    }

    // EXPRESSION CONTEXT //
    public setJobInputs(inputs: any): void {
        this.jobInputs = inputs || JobHelper.getNullJobInputs(this);
        this.validateAllExpressions();
        this.updateCommandLine();
    }

    abstract setRuntime(runtime: any): void;

    abstract getContext(input?: any): any;

    abstract resetJobDefaults(): void;


    // EVENT HANDLING //
    public on(event: string, handler): { dispose: Function } {
        return {
            dispose: this.eventHub.on(event, handler)
        }
    }

    public off(event: string, handler) {
        this.eventHub.off(event, handler);
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

    protected initializeExprWatchers() {
        this.eventHub.on("expression.create", (expr: ExpressionModel) => {
            this.expressions.add(expr);

            if (this.constructed) {
                this.validationPromises.push(this.validateExpression(expr));
            }
        });

        this.eventHub.on("expression.change", (expr: ExpressionModel) => {
            this.validationPromises.push(this.validateExpression(expr));
        });
    }

    protected validateExpression(expression: ExpressionModel): Promise<any> {
        let input;
        if (/inputs|outputs/.test(expression.loc)) {
            const loc = /.*(?:inputs\[\d+]|.*outputs\[\d+]|.*fields\[\d+])/
                .exec(expression.loc)[0] // take the first match
                .replace("document", ""); // so loc is relative to root
            input     = fetchByLoc(this, loc);
        }

        return expression.validate(this.getContext(input));
    }

    protected validateAllExpressions() {
        this.expressions.forEach(e => {
            this.validationPromises.push(this.validateExpression(e));
        });
    }

    // DOCUMENT TREE TRAVERSAL //

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
            if (root === null) {
                return null;
            }

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

    protected findFieldParent(loc: string): CommandOutputParameterModel | CommandOutputParameterModel {
        loc = loc.substr(this.loc.length).replace(/\.fields\[\d+]$/, "").replace(/\.type$/, "");
        return fetchByLoc(this, loc);
    }

    // CRUD HELPER METHODS //

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
        checkIdValidity(id, scope || [...this.inputs, ...this.outputs]);

        port.clearIssue(ErrorCode.ID_ALL);

        port.id = id;
        if (isType(port, ["record", "enum"])) {
            port.type.name = id;
        }

        // emit change event so CLT subclasses can change job values,
        // emits "input.change.id" or "output.change.id"
        this.eventHub.emit(`${type}.change.id`, {port, oldId, newId: port.id});
    }

    public addHint(hint?: ProcessRequirement | any): RequirementBaseModel {
        new UnimplementedMethodException("addHint", "CommandLineToolModel");
        return null;
    }

    public updateStream(stream: ExpressionModel, type: "stderr" | "stdin" | "stdout") {
        new UnimplementedMethodException("updateStream", "CommandLineToolModel");
    }

    _addOutput(outputConstructor, output = {id: null}) {
        const loc = incrementLastLoc(this.outputs, `${this.loc}.outputs`);

        output.id = output.id || getNextAvailableId("output", [...this.inputs, ...this.outputs]);

        const o = new outputConstructor(output, loc, this.eventHub);

        o.setValidationCallback(err => this.updateValidity(err));

        try {
            checkIdValidity(o.id, [...this.inputs, ...this.outputs])
        } catch (ex) {
            this.setIssue({
                [o.loc + ".id"]: {
                    type: "error",
                    message: ex.message,
                    code: ex.code
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
        this.outputs[index].clearIssue(ErrorCode.ALL);
        this.outputs[index].clearListeners();
        this.outputs.splice(index, 1);

        // start at the index and update location of all arguments after it
        for (let i = index; i < this.outputs.length; i++) {
            this.outputs[i].updateLoc(`${this.loc}.outputs[${i}]`);
        }

        this.eventHub.emit("output.remove", output);
    }

    protected _addInput(inputConstructor, input = {id: null}) {
        const loc = incrementLastLoc(this.inputs, `${this.loc}.inputs`);

        input.id = input.id || getNextAvailableId("input", [...this.inputs, ...this.outputs]);

        const i = new inputConstructor(input, loc, this.eventHub);

        i.setValidationCallback(err => this.updateValidity(err));

        try {
            checkIdValidity(i.id, [...this.inputs, ...this.outputs]);
        } catch (ex) {
            this.setIssue({
                [i.loc + ".id"]: {
                    type: "error",
                    message: ex.message,
                    code: ex.code
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
        this.inputs[index].clearIssue(ErrorCode.ALL);
        this.inputs[index].clearListeners();
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
        this.arguments[index].clearIssue(ErrorCode.ALL);
        this.arguments[index].clearListeners();
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

    public setRequirement(req: ProcessRequirement, hint?: boolean) {
        new UnimplementedMethodException("setRequirement", "CommandLineToolModel");
    }

    // COMMAND LINE //

    public updateCommandLine(): void {
        if (this.constructed) {
            this.generateCommandLineParts().then(res => {
                this.commandLineWatcher(res);
            })
        }
    }

    public onCommandLineResult(fn: Function) {
        this.commandLineWatcher = fn;
    }

    public generateCommandLine(): Promise<string> {
        return this.generateCommandLineParts().then((parts: CommandLinePart[]) => {
            const res = parts.filter(p => !!p.value).map(p => p.value).join(" ");
            return res.trim();
        });
    }

    public generateCommandLineParts(): Promise<CommandLinePart[]> {
        return generateCommandLineParts(this, this.jobInputs, this.runtime);
    }

    // SERIALIZATION //

    public serialize(): any {
        new UnimplementedMethodException("serialize", "CommandLineToolModel");
    }

    public deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize", "CommandLineToolModel");
    }

    // VALIDATION //

    public validate(): Promise<any> {
        return Promise.all(this.validationPromises).then(() => {
            this.validationPromises = [];
        });
    }
}
