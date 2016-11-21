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

export class CommandLineToolModel extends ValidationBase implements CommandLineRunnable, Validatable, Serializable<CommandLineTool> {
    job: any;
    jobInputs: any;

    id: string;

    inputs: Array<CommandInputParameterModel>   = [];
    outputs: Array<CommandOutputParameterModel> = [];
    readonly 'class': string;
    baseCommand: Array<ExpressionModel> = [];

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
        argument     = argument || new CommandInputParameterModel('');
        argument.loc = `${this.loc}.arguments[${this.arguments.length}]`;

        this.arguments.push(argument);

        argument.setValidationCallback((err: Validation) => {
            this.updateValidity(err);
        });

        return argument;    }

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
        output     = output || new CommandInputParameterModel('');
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
        //@todo(maya) create generic serialize/deserialize algorithm
        let base: CommandLineTool = <CommandLineTool>{};
        if (this.id) {
            base.id = this.id;
        }

        base.class       = "CommandLineTool";
        base.baseCommand = this.baseCommand.map(cmd => cmd.serialize());

        base = Object.assign({}, base, this.customProps);

        return base;
    }

    deserialize(attr: CommandLineTool): void {
        const serializedAttr = ["baseCommand", "class", "id"];

        this.id = attr.id;

        attr.inputs.forEach((input, index) => {
            this.addInput(new CommandInputParameterModel(`${this.loc}.inputs[${index}]`, input));
        });
        attr.inputs.forEach((output, index) => {
            this.addOutput(new CommandOutputParameterModel(`${this.loc}.outputs[${index}]`, output))
        });

        if (attr.arguments) {
            attr.arguments.forEach((arg, index) => {
                this.addArgument(new CommandArgumentModel(`${this.loc}.arguments[${index}]`, arg) )
            });
        }

        this.stdin  = attr.stdin || '';
        this.stdout = attr.stdout || '';

        this.successCodes       = attr.successCodes || [];
        this.temporaryFailCodes = attr.temporaryFailCodes || [];
        this.permanentFailCodes = attr.permanentFailCodes || [];
        attr.baseCommand        = attr.baseCommand || [''];

        // wrap to array
        attr.baseCommand = !Array.isArray(attr.baseCommand)
            ? [<string | Expression> attr.baseCommand]
            : <Array<string | Expression>> attr.baseCommand;

        this.baseCommand = [];

        (<Array<string | Expression>> attr.baseCommand)
            .forEach((cmd, index) => this.addBaseCommand(new ExpressionModel(`baseCommand[${index}]`, cmd)));

        this.job = attr['sbg:job']
            ? attr['sbg:job']
            : JobHelper.getJob(this);

        this.jobInputs = this.job.inputs || this.job;

        // populates object with all custom attributes not covered in model
        Object.keys(attr).forEach(key => {
            if (serializedAttr.indexOf(key) === -1) {
                this.customProps[key] = attr[key];
            }
        });
    }
}