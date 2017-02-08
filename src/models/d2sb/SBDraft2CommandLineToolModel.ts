import {CommandArgumentModel} from "./CommandArgumentModel";
import {CommandInputParameterModel} from "./CommandInputParameterModel";
import {CommandLinePart} from "../helpers/CommandLinePart";
import {CommandLineTool} from "../../mappings/d2sb/CommandLineTool";
import {CommandOutputParameterModel} from "./CommandOutputParameterModel";
import {Expression} from "../../mappings/d2sb/Expression";
import {JobHelper} from "../helpers/JobHelper";
import {CommandLineRunnable} from "../interfaces/CommandLineRunnable";
import {Serializable} from "../interfaces/Serializable";
import {ExpressionModel} from "./ExpressionModel";
import {ValidationBase, Validatable, Validation} from "../helpers/validation";
import {CommandInputParameter} from "../../mappings/d2sb/CommandInputParameter";
import {ProcessRequirementModel} from "./ProcessRequirementModel";
import {DockerRequirementModel} from "./DockerRequirementModel";
import {ProcessRequirement} from "../../mappings/d2sb/ProcessRequirement";
import {ExpressionEngineRequirementModel} from "./ExpressionEngineRequirementModel";
import {DockerRequirement} from "../../mappings/d2sb/DockerRequirement";
import {ExpressionEngineRequirement} from "../../mappings/d2sb/ExpressionEngineRequirement";
import {RequirementBaseModel} from "./RequirementBaseModel";
import {CreateFileRequirement} from "../../mappings/d2sb/CreateFileRequirement";
import {CreateFileRequirementModel} from "./CreateFileRequirementModel";
import {SBGCPURequirement} from "../../mappings/d2sb/SBGCPURequirement";
import {SBGMemRequirement} from "../../mappings/d2sb/SBGMemRequirement";
import {ResourceRequirementModel} from "./ResourceRequirementModel";
import {Observable, ReplaySubject} from "rxjs";
import {CommandLinePrepare} from "../helpers/CommandLinePrepare";
import {CommandOutputParameter} from "../../mappings/d2sb/CommandOutputParameter";

export class SBDraft2CommandLineToolModel extends ValidationBase implements CommandLineRunnable, Validatable, Serializable<CommandLineTool> {
    public job: any;
    public jobInputs: any;
    public readonly 'class': string;
    public id: string;

    public baseCommand: Array<ExpressionModel>         = [];
    public inputs: Array<CommandInputParameterModel>   = [];
    public outputs: Array<CommandOutputParameterModel> = [];

    private commandLine = new ReplaySubject<CommandLinePart[]>(1);

    public resources: { cpu?: ResourceRequirementModel, mem?: ResourceRequirementModel } = {};

    public docker: DockerRequirementModel;

    public requirements: Array<ProcessRequirementModel> = [];

    public createFileRequirement: CreateFileRequirementModel;

    public hints: Array<ProcessRequirementModel> = [];

    public arguments: Array<CommandArgumentModel> = [];

    public stdin: ExpressionModel;
    public stdout: ExpressionModel;

    public successCodes: number[];
    public temporaryFailCodes: number[];
    public permanentFailCodes: number[];

    private constructed = false;

    public customProps: any = {};

    constructor(loc: string, attr?: CommandLineTool) {
        super(loc || "document");
        this.class = "CommandLineTool";

        if (attr) this.deserialize(attr);
        this.constructed = true;
    }

    public addBaseCommand(cmd?: ExpressionModel): ExpressionModel {
        if (!cmd) {
            cmd = new ExpressionModel(`${this.loc}.baseCommand[${this.baseCommand.length}]`);
        } else {
            cmd.loc = `${this.loc}.baseCommand[${this.baseCommand.length}]`;
        }
        this.baseCommand.push(cmd);
        cmd.setValidationCallback((err: Validation) => {
            this.updateValidity(err);
        });

        return cmd;
    }

    public addArgument(argument: CommandArgumentModel) {
        argument     = argument || new CommandArgumentModel("");
        argument.loc = `${this.loc}.arguments[${this.arguments.length}]`;

        this.arguments.push(argument);

        argument.setValidationCallback((err: Validation) => {
            this.updateValidity(err);
        });

        return argument;
    }

    public removeArgument(arg: CommandArgumentModel | number) {
        if (typeof arg === "number") {
            this.arguments.splice(arg, 1);
        } else {
            this.arguments.splice(this.arguments.indexOf(arg), 1);
        }
    }

    public addInput(input?: CommandInputParameterModel) {
        input      = input || new CommandInputParameterModel();
        input.loc  = `${this.loc}.inputs[${this.inputs.length}]`;
        input.job  = this.job;
        input.self = JobHelper.generateMockJobData(input);

        this.inputs.push(input);

        input.setValidationCallback((err: Validation) => {
            this.updateValidity(err);
        });

        return input;
    }

    public removeInput(input: CommandInputParameterModel | number) {
        if (typeof input === "number") {
            this.inputs.splice(input, 1);
        } else {
            this.inputs.splice(this.inputs.indexOf(input), 1);
        }
    }

    public addOutput(output: CommandOutputParameterModel) {
        output     = output || new CommandOutputParameterModel();
        output.loc = `${this.loc}.outputs[${this.outputs.length}]`;

        this.outputs.push(output);

        output.setValidationCallback((err: Validation) => {
            this.updateValidity(err);
        });

        return output;
    }

    public removeOutput(output: CommandOutputParameterModel | number) {
        if (typeof output === "number") {
            this.outputs.splice(output, 1);
        } else {
            this.outputs.splice(this.outputs.indexOf(output), 1);
        }
    }

    public setRequirement(req: ProcessRequirement, hint?: boolean) {
        const prop = hint ? "hints" : "requirements";
        this.createReq(req, `${this.loc}.${prop}[${this[prop].length}]`, hint);
    }

    public updateStream(stream: ExpressionModel, type: "stdin" | "stdout") {
        this[type] = stream;
        stream.loc = `${this.loc}.${type}`;
        stream.setValidationCallback((err) => this.updateValidity(err));
    }

    public getCommandLine(): Promise<string> {
        return this.generateCommandLineParts().then(cmd => {
            const parts = cmd.map(part => part.value).join(" ");

            return parts.trim();
        });
    }

    public updateCommandLine(): void {
        if (this.constructed) {
            this.generateCommandLineParts().then(res => {
                this.commandLine.next(res);
            })
        }
    }

    public getCommandLineParts(): Observable<CommandLinePart[]> {
        this.updateCommandLine();
        return this.commandLine as Observable<CommandLinePart[]>;
    }

    private generateCommandLineParts(): Promise<CommandLinePart[]> {
        const flatInputs = CommandLinePrepare.flattenInputsAndArgs([].concat(this.arguments).concat(this.inputs));

        const job = this.job.inputs ?
            Object.assign({inputs: JobHelper.getJob(this)}, this.job || {}) : this.job || {};

        const flatJobInputs = CommandLinePrepare.flattenJob(job.inputs || job, {});

        const baseCmdPromise = this.baseCommand.map(cmd => {
            return CommandLinePrepare.prepare(cmd, flatJobInputs, job, cmd.loc, "baseCommand").then(suc => {
                if (suc instanceof CommandLinePart) return suc;
                return new CommandLinePart(<string>suc, "baseCommand", cmd.loc);
            }, err => {
                return new CommandLinePart(`<${err.type} at ${err.loc}>`, err.type, cmd.loc);
            });
        });

        const inputPromise = flatInputs.map(input => {
            return CommandLinePrepare.prepare(input, flatJobInputs, job, input.loc)
        }).filter(i => i instanceof Promise).map(promise => {
            return promise.then(succ => succ, err => {
                return new CommandLinePart(`<${err.type} at ${err.loc}>`, err.type);
            });
        });

        const stdOutPromise = CommandLinePrepare.prepare(this.stdout, flatJobInputs, job, this.stdout.loc, "stdout");
        const stdInPromise = CommandLinePrepare.prepare(this.stdin, flatJobInputs, job, this.stdin.loc, "stdin");

        return Promise.all([].concat(baseCmdPromise, inputPromise, stdOutPromise, stdInPromise)).then(parts => {
            return parts.filter(part => part !== null);
        });
    }

    public setJob(job: any) {
        this.job       = job;
        this.jobInputs = this.job.inputs || this.job;
    }

    public setJobProperty(key: string, value: any) {
        this.updateCommandLine();
        this.jobInputs[key] = value;
    }

    validate(): Validation {
        const validation: Validation = {errors: [], warnings: []};

        // check if all inputs are valid
        this.inputs.forEach(input => {
            input.validate();
        });

        this.baseCommand.forEach(cmd => cmd.validate());

        // check if inputs have unique id

        this.validation.errors   = this.validation.errors.concat(validation.errors);
        this.validation.warnings = this.validation.warnings.concat(validation.warnings);

        return this.validation;
    }

    serialize(): CommandLineTool | any {
        let base: CommandLineTool = <CommandLineTool>{};
        if (this.id) {
            base.id = this.id;
        }

        base.cwlVersion = "sbg:draft-2";
        base.class = "CommandLineTool";

        // BASECOMMAND
        base.baseCommand = this.baseCommand
            .map(cmd => <Expression | string> cmd.serialize())
            .filter(cmd => !!cmd)
            .reduce((acc, curr) => {
                if (typeof curr === "string") {
                    //@todo implement not splitting quoted text
                    return acc.concat(curr.split(/\s+/));
                } else {
                    return acc.concat([curr]);
                }
            }, []);

        // INPUTS
        base.inputs = <Array<CommandInputParameter>> this.inputs
            .map(input => input.serialize());

        // OUTPUTS
        base.outputs = <Array<CommandOutputParameter>> this.outputs
            .map(output => output.serialize());

        // REQUIREMENTS
        base.requirements = [];
        if (this.requirements.length) {
            base.requirements = this.requirements.map(req => req.serialize());
        }

        if (this.createFileRequirement) base.requirements.push(this.createFileRequirement.serialize());

        if (!base.requirements.length) delete base.requirements;

        // HINTS
        base.hints = [];

        if (this.hints.length) {
            base.hints = this.hints.map(hint => hint.serialize());
        }

        if (this.resources.cpu) base.hints.push(this.resources.cpu.serialize());
        if (this.resources.mem) base.hints.push(this.resources.mem.serialize());
        if (this.docker) base.hints.push(this.docker.serialize());

        if (!base.hints.length) delete base.hints;

        // ARGUMENTS
        if (this.arguments.length) {
            base.arguments = this.arguments.map(arg => arg.serialize());
        }

        // STREAM
        if (this.stdin.serialize()) {
            base.stdin = <string | Expression> this.stdin.serialize();
        }

        if (this.stdout.serialize()) {
            base.stdout = <string | Expression> this.stdout.serialize();
        }

        // JOB
        if (this.job) {
            base["sbg:job"] = this.job;
        }

        base = Object.assign({}, base, this.customProps);

        return base;
    }

    deserialize(tool: CommandLineTool): void {
        const serializedAttr = [
            "baseCommand",
            "class",
            "id",
            "inputs",
            "hints",
            "requirements",
            "arguments",
            "outputs",
            "stdin",
            "stdout",
            "cwlVersion"
        ];

        this.id = tool.id;

        tool.inputs.forEach((input, index) => {
            this.addInput(new CommandInputParameterModel(input, `${this.loc}.inputs[${index}]`));
        });
        tool.outputs.forEach((output, index) => {
            this.addOutput(new CommandOutputParameterModel(output, `${this.loc}.outputs[${index}]`))
        });

        if (tool.arguments) {
            tool.arguments.forEach((arg, index) => {
                this.addArgument(new CommandArgumentModel(arg, `${this.loc}.arguments[${index}]`));
            });
        }

        if (tool.requirements) {
            tool.requirements.forEach((req, index) => {
                this.createReq(req, `${this.loc}.requirements[${index}]`);
            });
        }

        if (tool.hints) {
            tool.hints.forEach((hint, index) => {
                this.createReq(hint, `${this.loc}.hints[${index}]`, true);
            });
        }

        this.updateStream(new ExpressionModel(`${this.loc}.stdin`, tool.stdin), "stdin");
        this.updateStream(new ExpressionModel(`${this.loc}.stdout`, tool.stdout), "stdout");

        this.successCodes       = tool.successCodes || [];
        this.temporaryFailCodes = tool.temporaryFailCodes || [];
        this.permanentFailCodes = tool.permanentFailCodes || [];
        tool.baseCommand        = tool.baseCommand || [''];

        // wrap to array
        tool.baseCommand = !Array.isArray(tool.baseCommand)
            ? [<string | Expression> tool.baseCommand]
            : <Array<string | Expression>> tool.baseCommand;

        this.baseCommand = [];

        (<Array<string | Expression>> tool.baseCommand).reduce((acc, curr) => {
            if (typeof curr === "string") {
                if (typeof acc[acc.length - 1] === "string") {
                    acc[acc.length - 1] += ` ${curr}`;
                    return acc;
                } else {
                    return acc.concat([curr]);
                }
            } else {
                return acc.concat([curr]);
            }
        }, []).forEach((cmd, index) => {
            this.addBaseCommand(new ExpressionModel(`baseCommand[${index}]`, cmd))
        });

        this.job = tool['sbg:job']
            ? tool['sbg:job']
            : {inputs: JobHelper.getJob(this), allocatedResources: {mem: 1000, cpu: 1}};

        this.jobInputs = this.job.inputs || this.job;

        // populates object with all custom attributes not covered in model
        Object.keys(tool).forEach(key => {
            if (serializedAttr.indexOf(key) === -1) {
                this.customProps[key] = tool[key];
            }
        });
    }

    private createReq(req: ProcessRequirement, loc: string, hint?: boolean) {
        let reqModel: ProcessRequirementModel;
        const property = hint ? "hints" : "requirements";

        switch (req.class) {
            case "DockerRequirement":
                this.docker = new DockerRequirementModel(<DockerRequirement>req, loc);
                return;
            case "ExpressionEngineRequirement":
                reqModel = new ExpressionEngineRequirementModel(<ExpressionEngineRequirement>req, loc);
                break;
            case "CreateFileRequirement":
                reqModel                   = new CreateFileRequirementModel(<CreateFileRequirement>req, loc);
                this.createFileRequirement = <CreateFileRequirementModel> reqModel;
                reqModel.setValidationCallback(err => this.updateValidity(err));
                return;
            case "sbg:CPURequirement":
                reqModel           = new ResourceRequirementModel(<SBGCPURequirement | SBGMemRequirement>req, loc);
                this.resources.cpu = <ResourceRequirementModel>reqModel;
                reqModel.setValidationCallback(err => this.updateValidity(err));
                return;
            case "sbg:MemRequirement":
                reqModel           = new ResourceRequirementModel(<SBGCPURequirement | SBGMemRequirement>req, loc);
                this.resources.mem = <ResourceRequirementModel>reqModel;
                reqModel.setValidationCallback(err => this.updateValidity(err));
                return;
            default:
                reqModel = new RequirementBaseModel(req, loc);
        }
        if (reqModel) {
            this[property].push(reqModel);
            reqModel.setValidationCallback((err: Validation) => {
                this.updateValidity(err);
            });
        }
    }
}