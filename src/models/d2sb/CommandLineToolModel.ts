import {CommandArgumentModel} from "./CommandArgumentModel";
import {CommandInputParameterModel} from "./CommandInputParameterModel";
import {CommandLinePart} from "../helpers/CommandLinePart";
import {CommandLineTool} from "../../mappings/d2sb/CommandLineTool";
import {CommandOutputParameterModel} from "./CommandOutputParameterModel";
import {Expression} from "../../mappings/d2sb/Expression";
import {JobHelper} from "../helpers/JobHelper";
import {CommandLineRunnable} from "../interfaces/CommandLineRunnable";
import {MSDSort} from "../helpers/MSDSort";
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

export class CommandLineToolModel extends ValidationBase implements CommandLineRunnable, Validatable, Serializable<CommandLineTool> {
    job: any;
    jobInputs: any;
    readonly 'class': string;
    id: string;

    baseCommand: Array<ExpressionModel>         = [];
    inputs: Array<CommandInputParameterModel>   = [];
    outputs: Array<CommandOutputParameterModel> = [];

    resources: {cpu?: ResourceRequirementModel, mem?: ResourceRequirementModel} = {};

    docker: DockerRequirementModel;

    requirements: {
        CreateFileRequirement?: CreateFileRequirementModel,
        ExpressionEngineRequirement?: ExpressionEngineRequirementModel,
        DockerRequirement?: DockerRequirementModel,
        [id: string]: ProcessRequirementModel
    } = {};

    hints: {
        "sbg:CPURequirement"?: ResourceRequirementModel,
        "sbg:MemRequirement"?: ResourceRequirementModel,
        DockerRequirement?: DockerRequirementModel,
        [id: string]: ProcessRequirementModel
    } = {};

    arguments: Array<CommandArgumentModel> = [];

    stdin: string | Expression;
    stdout: string | Expression;

    successCodes: number[];
    temporaryFailCodes: number[];
    permanentFailCodes: number[];

    customProps: any = {};

    constructor(loc: string, attr?: CommandLineTool) {
        super(loc || "document");
        this.class = "CommandLineTool";

        if (attr) this.deserialize(attr);
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
        input     = input || new CommandInputParameterModel('');
        input.loc = `${this.loc}.inputs[${this.inputs.length}]`;
        input.job = this.job;

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
        this.createReq(req, `${this.loc}.${prop}[${Object.keys(this.requirements).length}]`, hint);
    }

    public getCommandLine(): string {
        //@todo(maya): implement with Observables so command line isn't generated anew every time
        const parts = this.getCommandLineParts()
            .filter(part => part !== null)
            .map(part => part.value)
            .join(' ');

        return parts.trim();
    }

    public getCommandLineParts(): CommandLinePart[] {
        const inputParts = this.inputs.map(input => {
            const normalizedId = input.id.charAt(0) === '#'
                ? input.id.substring(1)
                : input.id;
            const jobInput     = this.jobInputs[normalizedId];
            try {
                return input.getCommandPart(this.job, jobInput);
            } catch (ex) {
                // potential mismatch input and value type
                // @todo(maya) add to validation stack
                return null;
            }
        });
        const argParts   = this.arguments.map(arg => arg.getCommandPart(this.job));
        const concat     = inputParts.concat(argParts).filter(item => item !== null);

        MSDSort.sort(concat);

        const baseCmdParts = (this.baseCommand)
            .map((baseCmd) => {
                baseCmd.evaluate({$job: this.job});
                if (baseCmd.validation.errors.length) {
                    return new CommandLinePart(`<Error at ${baseCmd.loc}>`, 0, "error");
                }
                if (baseCmd.validation.warnings.length) {
                    return new CommandLinePart(`<Warning at ${baseCmd.loc}>`, 0, "warning");
                }
                return new CommandLinePart(baseCmd.result, 0, "baseCommand");
            });

        return baseCmdParts.concat(concat);
    }

    public setJob(job: any) {
        this.job       = job;
        this.jobInputs = this.job.inputs || this.job;
    }

    public setJobProperty(key: string, value: any) {
        console.warn("Not implemented yet");
    }

    validate(): Validation {
        const validation: Validation = {errors: [], warnings: []};

        // check if all inputs are valid
        this.inputs.forEach(input => {
            input.validate();
        });

        this.baseCommand.forEach(cmd => cmd.validate());

        // check if ID exists and is valid

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

        base.class       = "CommandLineTool";
        base.baseCommand = this.baseCommand
            .map(cmd => <Expression | string> cmd.serialize())
            .filter(cmd => !!cmd);
        base.inputs      = <Array<CommandInputParameter>> this.inputs
            .map(input => input.serialize());
        base.outputs     = this.outputs.map(output => output.serialize());

        if (Object.keys(this.requirements).length) {
            base.requirements = Object.keys(this.requirements)
                .map(key => this.requirements[key].serialize());
        }

        base.hints = [];

        if (Object.keys(this.hints).length) {
            base.hints = Object.keys(this.hints).map(key => this.hints[key].serialize());
        }

        if (this.resources.cpu) base.hints.push(this.resources.cpu.serialize());
        if (this.resources.mem) base.hints.push(this.resources.mem.serialize());
        if (this.docker) base.hints.push(this.docker.serialize());

        if (this.arguments.length) {
            base.arguments = this.arguments.map(arg => arg.serialize());
        }

        if (!base.hints.length) delete base.hints;

        base = Object.assign({}, base, this.customProps);

        return base;
    }

    deserialize(tool: CommandLineTool): void {
        const serializedAttr = ["baseCommand", "class", "id", "inputs", "hints", "requirements", "arguments", "outputs"];

        this.id = tool.id;

        tool.inputs.forEach((input, index) => {
            this.addInput(new CommandInputParameterModel(`${this.loc}.inputs[${index}]`, input));
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

        this.stdin  = tool.stdin || '';
        this.stdout = tool.stdout || '';

        this.successCodes       = tool.successCodes || [];
        this.temporaryFailCodes = tool.temporaryFailCodes || [];
        this.permanentFailCodes = tool.permanentFailCodes || [];
        tool.baseCommand        = tool.baseCommand || [''];

        // wrap to array
        tool.baseCommand = !Array.isArray(tool.baseCommand)
            ? [<string | Expression> tool.baseCommand]
            : <Array<string | Expression>> tool.baseCommand;

        this.baseCommand = [];

        (<Array<string | Expression>> tool.baseCommand)
            .forEach((cmd, index) => this.addBaseCommand(new ExpressionModel(`baseCommand[${index}]`, cmd)));

        this.job = tool['sbg:job']
            ? tool['sbg:job']
            : JobHelper.getJob(this);

        this.jobInputs = this.job.inputs || this.job;

        // populates object with all custom attributes not covered in model
        Object.keys(tool).forEach(key => {
            if (serializedAttr.indexOf(key) === -1) {
                this.customProps[key] = tool[key];
            }
        });
    }

    createReq(req: ProcessRequirement, loc: string, hint?: boolean) {
        let reqModel: ProcessRequirementModel;
        const property = hint ? "hints" : "requirements";

        switch (req.class) {
            case "DockerRequirement":
                this.docker = new DockerRequirementModel(<DockerRequirement>req, loc);
                break;
            case "ExpressionEngineRequirement":
                reqModel = new ExpressionEngineRequirementModel(<ExpressionEngineRequirement>req, loc);
                break;
            case "CreateFileRequirement":
                reqModel = new CreateFileRequirementModel(<CreateFileRequirement>req, loc);
                break;
            case "sbg:CPURequirement":
                this.resources.cpu = new ResourceRequirementModel(<SBGCPURequirement | SBGMemRequirement>req, loc);
                return;
            case "sbg:MemRequirement":
                this.resources.mem = new ResourceRequirementModel(<SBGCPURequirement | SBGMemRequirement>req, loc);
                return;
            default:
                reqModel = new RequirementBaseModel(req, loc);
        }
        if (reqModel) {
            this[property][req.class] = reqModel;
            reqModel.setValidationCallback((err: Validation) => {
                this.updateValidity(err);
            });
        }
    }
}