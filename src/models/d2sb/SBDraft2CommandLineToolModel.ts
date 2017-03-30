import {SBDraft2CommandArgumentModel} from "./SBDraft2CommandArgumentModel";
import {SBDraft2CommandInputParameterModel} from "./SBDraft2CommandInputParameterModel";
import {CommandLinePart} from "../helpers/CommandLinePart";
import {CommandLineTool} from "../../mappings/d2sb/CommandLineTool";
import {SBDraft2CommandOutputParameterModel} from "./SBDraft2CommandOutputParameterModel";
import {Expression} from "../../mappings/d2sb/Expression";
import {JobHelper} from "../helpers/JobHelper";
import {Serializable} from "../interfaces/Serializable";
import {SBDraft2ExpressionModel} from "./SBDraft2ExpressionModel";
import {Validation} from "../helpers/validation";
import {CommandInputParameter} from "../../mappings/d2sb/CommandInputParameter";
import {ProcessRequirementModel} from "../generic/ProcessRequirementModel";
import {DockerRequirementModel} from "../generic/DockerRequirementModel";
import {ProcessRequirement} from "../../mappings/d2sb/ProcessRequirement";
import {DockerRequirement} from "../../mappings/d2sb/DockerRequirement";
import {RequirementBaseModel} from "../generic/RequirementBaseModel";
import {CreateFileRequirement} from "../../mappings/d2sb/CreateFileRequirement";
import {SBDraft2CreateFileRequirementModel} from "./SBDraft2CreateFileRequirementModel";
import {SBGCPURequirement} from "../../mappings/d2sb/SBGCPURequirement";
import {SBGMemRequirement} from "../../mappings/d2sb/SBGMemRequirement";
import {SBDraft2ResourceRequirementModel} from "./SBDraft2ResourceRequirementModel";
import {CommandLinePrepare} from "../helpers/CommandLinePrepare";
import {CommandOutputParameter} from "../../mappings/d2sb/CommandOutputParameter";
import {CommandLineToolModel} from "../generic/CommandLineToolModel";
import {snakeCase, spreadSelectProps} from "../helpers/utils";
import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";

export class SBDraft2CommandLineToolModel extends CommandLineToolModel implements Serializable<CommandLineTool> {
    public job: any;
    public jobInputs: any;
    public id: string;
    public label: string;
    public description: string;

    public cwlVersion = "sbg:draft-2";

    public baseCommand: Array<SBDraft2ExpressionModel>         = [];
    public inputs: Array<SBDraft2CommandInputParameterModel>   = [];
    public outputs: Array<SBDraft2CommandOutputParameterModel> = [];

    private sbgId: string;

    public resources = new SBDraft2ResourceRequirementModel();

    public docker: DockerRequirementModel;

    public requirements: Array<ProcessRequirementModel> = [];

    public fileRequirement: SBDraft2CreateFileRequirementModel;

    public hints: Array<ProcessRequirementModel> = [];

    public arguments: Array<SBDraft2CommandArgumentModel> = [];

    public stdin: SBDraft2ExpressionModel;
    public stdout: SBDraft2ExpressionModel;
    public hasStdErr = false;

    public successCodes: number[];
    public temporaryFailCodes: number[];
    public permanentFailCodes: number[];

    private constructed = false;

    public customProps: any = {};

    constructor(loc: string, attr?: CommandLineTool) {
        super(loc || "document");

        if (attr) this.deserialize(attr);
        this.constructed = true;
    }


    public addHint(hint?: ProcessRequirement | any): RequirementBaseModel {
        const h = new RequirementBaseModel(hint, SBDraft2ExpressionModel, `${this.loc}.hints[${this.hints.length}]`);
        h.setValidationCallback(err => this.updateValidity(err));
        this.hints.push(h);

        return h;
    }

    public addBaseCommand(cmd?: SBDraft2ExpressionModel): SBDraft2ExpressionModel {
        if (!cmd) {
            cmd = new SBDraft2ExpressionModel("", `${this.loc}.baseCommand[${this.baseCommand.length}]`);
        } else {
            cmd.loc = `${this.loc}.baseCommand[${this.baseCommand.length}]`;
        }
        this.baseCommand.push(cmd);
        cmd.setValidationCallback((err: Validation) => {
            this.updateValidity(err);
        });

        return cmd;
    }

    public addArgument(arg?: string | CommandLineBinding): SBDraft2CommandArgumentModel {
        const argument     = new SBDraft2CommandArgumentModel(arg, `${this.loc}.arguments[${this.arguments.length}]`);
        this.arguments.push(argument);

        argument.setValidationCallback((err: Validation) => {
            this.updateValidity(err);
        });

        return argument;
    }

    public removeArgument(arg: SBDraft2CommandArgumentModel | number) {
        if (typeof arg === "number") {
            this.arguments.splice(arg, 1);
        } else {
            this.arguments.splice(this.arguments.indexOf(arg), 1);
        }
    }

    public addInput(input?: CommandInputParameter): SBDraft2CommandInputParameterModel {
        const i = new SBDraft2CommandInputParameterModel(input, `${this.loc}.inputs[${this.inputs.length}]`);
        i.job   = this.job;
        i.self  = JobHelper.generateMockJobData(i);

        this.inputs.push(i);

        i.setValidationCallback((err: Validation) => {
            this.updateValidity(err);
        });

        return i;
    }

    public removeInput(input: SBDraft2CommandInputParameterModel | number) {
        if (typeof input === "number") {
            this.inputs.splice(input, 1);
        } else {
            this.inputs.splice(this.inputs.indexOf(input), 1);
        }
    }

    public addOutput(output: CommandOutputParameter): SBDraft2CommandOutputParameterModel {
        const o = new SBDraft2CommandOutputParameterModel(output, `${this.loc}.outputs[${this.outputs.length}]`);
        this.outputs.push(o);

        o.setValidationCallback((err: Validation) => {
            this.updateValidity(err);
        });

        return o;
    }

    public removeOutput(output: SBDraft2CommandOutputParameterModel | number) {
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

    public updateStream(stream: SBDraft2ExpressionModel, type: "stdin" | "stdout") {
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
                this.commandLineWatcher(res);
            })
        }
    }

    private commandLineWatcher: Function = () => {
    };

    public onCommandLineResult(fn: Function) {
        this.commandLineWatcher = fn;
    }

    private generateCommandLineParts(): Promise<CommandLinePart[]> {
        const flatInputs = CommandLinePrepare.flattenInputsAndArgs([].concat(this.arguments).concat(this.inputs));

        const job = this.job.inputs ?
            Object.assign({inputs: JobHelper.getJob(this)}, this.job || {}) : this.job || {};

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

    public setJobInputs(inputs: any) {
        this.job.inputs = inputs;
        this.jobInputs = inputs;
    }

    public setRuntime(runtime: any): void {
        this.job.allocatedResources = runtime;
    }

    public getContext(id?: string) {
        const context: any = {
            $job: this.job
        };

        if (id) {
            context.$self = this.job.inputs[id];
        }

        return context;
    }


    public setJobProperty(key: string, value: any) {
        this.updateCommandLine();
        this.jobInputs[key] = value;
    }

    public resetJobDefaults() {
        this.jobInputs = JobHelper.getJob(this);
        this.job       = {inputs: this.jobInputs, allocatedResources: {mem: 1000, cpu: 1}};
        this.updateCommandLine();
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

        base.cwlVersion = "sbg:draft-2";
        base.class      = "CommandLineTool";

        if (this.sbgId || this.id) {
            base.id = this.sbgId || this.id;
        }

        if (this.label) base.label = this.label;
        if (this.description) base.description = this.description;

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

        if (this.fileRequirement.serialize()) base.requirements.push(this.fileRequirement.serialize());

        if (!base.requirements.length) delete base.requirements;

        // HINTS
        base.hints = [];

        if (this.hints.length) {
            base.hints = this.hints.map(hint => hint.serialize());
        }

        if (this.resources.cores.serialize() !== undefined) {
            base.hints.push({
                "class": "sbg:CPURequirement",
                value: this.resources.cores.serialize()
            })
        }

        if (this.resources.mem.serialize() !== undefined) {
            base.hints.push({
                "class": "sbg:MemRequirement",
                value: this.resources.mem.serialize()
            })
        }

        if (this.docker.serialize()) base.hints.push(this.docker.serialize());

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
            "label",
            "description",
            "inputs",
            "hints",
            "requirements",
            "arguments",
            "outputs",
            "stdin",
            "stdout",
            "cwlVersion"
        ];

        this.id = tool["sbg:id"] && tool["sbg:id"].split("/").length > 3 ?
            tool["sbg:id"].split("/")[2] :
            snakeCase(tool.id);

        this.sbgId = tool["sbg:id"];

        this.label       = tool.label;
        this.description = tool.description;

        tool.inputs.forEach(i => this.addInput(i));

        tool.outputs.forEach(o => this.addOutput(o));

        if (tool.arguments) {
            tool.arguments.forEach((arg, index) => {
                this.addArgument(arg);
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

        this.docker = this.docker || new DockerRequirementModel(<DockerRequirement> {}, `${this.loc}.hints[${this.hints.length}]`);
        this.docker.isHint = true;

        this.fileRequirement = this.fileRequirement || new SBDraft2CreateFileRequirementModel(<CreateFileRequirement> {}, `${this.loc}.requirements[${this.requirements.length}]`);

        this.updateStream(new SBDraft2ExpressionModel(tool.stdin, `${this.loc}.stdin`), "stdin");
        this.updateStream(new SBDraft2ExpressionModel(tool.stdout, `${this.loc}.stdout`), "stdout");

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
        }, []).forEach((cmd) => {
            this.addBaseCommand(new SBDraft2ExpressionModel(cmd))
        });

        this.job = tool['sbg:job']
            ? tool['sbg:job']
            : {inputs: JobHelper.getJob(this), allocatedResources: {mem: 1000, cpu: 1}};

        this.jobInputs = this.job.inputs || this.job;

        // populates object with all custom attributes not covered in model
        spreadSelectProps(tool, this.customProps, serializedAttr);
    }

    private createReq(req: ProcessRequirement, loc: string, hint?: boolean) {
        let reqModel: ProcessRequirementModel;
        const property = hint ? "hints" : "requirements";

        switch (req.class) {
            case "DockerRequirement":
                this.docker = new DockerRequirementModel(req, loc);
                this.docker.setValidationCallback(err => this.updateValidity(err));
                return;
            case "CreateFileRequirement":
                reqModel             = new SBDraft2CreateFileRequirementModel(<CreateFileRequirement>req, loc);
                this.fileRequirement = <SBDraft2CreateFileRequirementModel> reqModel;
                reqModel.setValidationCallback(err => this.updateValidity(err));
                return;
            case "sbg:CPURequirement":
                this.resources.cores = new SBDraft2ExpressionModel((<SBGCPURequirement>req).value, `${loc}.value`);
                this.resources.cores.setValidationCallback(err => this.updateValidity(err));
                return;
            case "sbg:MemRequirement":
                this.resources.mem = new SBDraft2ExpressionModel((<SBGMemRequirement>req).value, `${loc}.value`);
                this.resources.mem.setValidationCallback(err => this.updateValidity(err));
                return;
            default:
                reqModel = new RequirementBaseModel(req, SBDraft2ExpressionModel, loc);
        }
        if (reqModel) {
            this[property].push(reqModel);
            reqModel.setValidationCallback((err) => this.updateValidity(err));
        }
    }
}