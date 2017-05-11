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
import {fetchByLoc, incrementString, isEmpty, validateID} from "../helpers/utils";
import {CommandLinePrepare} from "../helpers/CommandLinePrepare";
import {CommandLinePart} from "../helpers/CommandLinePart";
import {JobHelper} from "../helpers/JobHelper";

export abstract class CommandLineToolModel extends ValidationBase implements Serializable<any> {
    public id: string;

    public cwlVersion: string | CWLVersion;

    public "class" = "CommandLineTool";

    public sbgId: string;

    public baseCommand: ExpressionModel[]         = [];
    public inputs: CommandInputParameterModel[]   = [];
    public outputs: CommandOutputParameterModel[] = [];

    public arguments: CommandArgumentModel[] = [];

    public docker: DockerRequirementModel;

    public requirements: Array<ProcessRequirementModel> = [];
    public hints: Array<ProcessRequirementModel>        = [];

    public stdin: ExpressionModel;
    public stdout: ExpressionModel;
    public stderr: ExpressionModel;
    public hasStdErr: boolean;

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
            "argument.create",
            "argument.remove",
            "validate"
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

    protected getNextAvailableId(id: string) {
        let hasId  = true;
        let result = id;

        const set = [...this.inputs, ...this.outputs];
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

    protected checkIdValidity(id: string) {
        validateID(id);

        const next = this.getNextAvailableId(id);
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
        // emit set proper type so event can be emitted and validity can be scoped
        if (port instanceof CommandInputParameterModel) {
            type = "input";
        } else if (port instanceof CommandOutputParameterModel) {
            type = "output";
        }

        // verify that the new ID can be set
        this.checkIdValidity(id);

        port.id = id;
        // emit change event so CLT subclasses can change job values
        this.eventHub.emit(`${type}.change.id`, {port, oldId, newId: port.id});
    }

    protected initializeJobWatchers() {
        this.eventHub.on("input.change.id", (data) => {
            this.jobInputs[data.newId] = this.jobInputs[data.oldId] || JobHelper.generateMockJobData(data.port);
            delete this.jobInputs[data.oldId];
            this.updateCommandLine();
            console.log('input id changed');
        });

        this.eventHub.on("io.change.type", (loc: string) => {
            if (loc.search(this.loc) === 0 && loc.search("inputs") > -1) {
                loc = loc.substr(this.loc.length).replace("type", "");
                const port: CommandInputParameterModel = fetchByLoc(this, loc);
                if (!port)  {
                    // newly added inputs will trigger this event before they are added to tool
                    return;
                }
                this.jobInputs[port.id] = JobHelper.generateMockJobData(port);
                this.updateCommandLine();
            }
        });

        this.eventHub.on("input.remove", (port: CommandInputParameterModel) => {
            delete this.jobInputs[port.id];
            this.updateCommandLine();
        });

        this.eventHub.on("input.create", (port: CommandInputParameterModel) => {
            this.jobInputs[port.id] = JobHelper.generateMockJobData(port);
            this.updateCommandLine();
        });
    }

    public addHint(hint?: ProcessRequirement | any): RequirementBaseModel {
        new UnimplementedMethodException("addHint", "CommandLineToolModel");
        return null;
    }

    public updateStream(stream: ExpressionModel, type: "stderr" | "stdin" | "stdout") {
        new UnimplementedMethodException("updateStream", "CommandLineToolModel");
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
        this.outputs.splice(index, 1);
        this.eventHub.emit("output.remove", output);
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
        this.inputs.splice(index, 1);
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
        this.arguments.splice(index, 1);
        this.eventHub.emit("argument.remove", arg);
    }

    public addBaseCommand(cmd?): ExpressionModel {
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

    public getContext(id?: string): any {
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

    public generateCommandLineParts(): Promise<CommandLinePart[]> {
        const flatInputs = CommandLinePrepare.flattenInputsAndArgs([].concat(this.arguments).concat(this.inputs));

        const job = isEmpty(this.jobInputs) ? // if job has not been populated
            {...{inputs: JobHelper.getJobInputs(this)}, ...{runtime: this.runtime}} : // supply dummy values
            this.getContext(); // otherwise use job

        const flatJobInputs = CommandLinePrepare.flattenJob(job.inputs || job, {});

        const baseCmdPromise = this.baseCommand.map(cmd => {
            return CommandLinePrepare.prepare(cmd, flatJobInputs, this.getContext(), cmd.loc, "baseCommand").then(suc => {
                if (suc instanceof CommandLinePart) return suc;
                return new CommandLinePart(<string>suc, "baseCommand", cmd.loc);
            }, err => {
                return new CommandLinePart(`<${err.type} at ${err.loc}>`, err.type, cmd.loc);
            });
        });

        const inputPromise = flatInputs.map(input => {
            return CommandLinePrepare.prepare(input, flatJobInputs, this.getContext(input["id"]), input.loc)
        }).filter(i => i instanceof Promise).map(promise => {
            return promise.then(succ => succ, err => {
                return new CommandLinePart(`<${err.type} at ${err.loc}>`, err.type);
            });
        });

        const stdOutPromise = CommandLinePrepare.prepare(this.stdout, flatJobInputs, this.getContext(), this.stdout.loc, "stdout");
        const stdInPromise  = CommandLinePrepare.prepare(this.stdin, flatJobInputs, this.getContext(), this.stdin.loc, "stdin");

        return Promise.all([].concat(baseCmdPromise, inputPromise, stdOutPromise, stdInPromise)).then(parts => {
            return parts.filter(part => part !== null);
        });
    }

}
