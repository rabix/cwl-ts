import {CommandArgumentModel} from "./CommandArgumentModel";
import {CommandInputParameterModel} from "./CommandInputParameterModel";
import {CommandLinePart} from "../helpers/CommandLinePart";
import {CommandLineTool} from "../../mappings/d2sb/CommandLineTool";
import {CommandOutputParameterModel} from "./CommandOutputParameterModel";
import {Expression} from "../../mappings/d2sb/Expression";
import {JobHelper} from "../helpers/JobHelper";
import {CommandLineRunnable} from "../interfaces/CommandLineRunnable";
import {ExpressionEvaluator} from "../helpers/ExpressionEvaluator";
import {MSDSort} from "../helpers/MSDSort";
import {ValidationError} from "../interfaces/ValidationError";
import {Serializable} from "../interfaces/Serializable";
import {Validatable} from "../interfaces/Validatable";
import {ExpressionModel} from "./ExpressionModel";

export class CommandLineToolModel implements CommandLineRunnable, Validatable, Serializable<CommandLineTool> {
    job: any;
    jobInputs: any;

    id: string;

    inputs: Array<CommandInputParameterModel>;
    outputs: Array<CommandOutputParameterModel>;
    readonly 'class': string;
    baseCommand: Array<ExpressionModel>;

    arguments: Array<CommandArgumentModel>;

    stdin: string | Expression;
    stdout: string | Expression;

    successCodes: number[];
    temporaryFailCodes: number[];
    permanentFailCodes: number[];

    customProps: any = {};

    constructor(attr?: CommandLineTool) {
        this.class = "CommandLineTool";

        if (attr) this.deserialize(attr);
    }

    public addArgument(arg: CommandArgumentModel) {
        this.arguments.push(arg);
    }

    public removeArgument(arg: CommandArgumentModel | number) {
        if (typeof arg === "number") {
            this.arguments.splice(arg, 1);
        } else {
            this.arguments.splice(this.arguments.indexOf(arg), 1);
        }
    }

    public addInput(input?: CommandInputParameterModel) {
        input = input || new CommandInputParameterModel();
        this.inputs.push(input);

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
        this.outputs.push(output);
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
                const cmd = baseCmd.serialize();
                if (typeof cmd === 'string') {
                    return new CommandLinePart(cmd, 0, "baseCommand");
                } else {
                    const val = ExpressionEvaluator.evaluateD2(cmd, this.job);
                    return new CommandLinePart(val, 0, "baseCommand");
                }
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

    validate(): ValidationError[] {
        let errors: ValidationError[] = [];

        // check base command
        // if (this.baseCommand === [] || this.baseCommand === ['']) {
        //     errors.push({
        //         type: "Error",
        //         location: "baseCommand",
        //         message: "Missing required property baseCommand"
        //     });
        // }

        // check if all inputs are valid
        errors.concat(this.inputs
            .map(input => input.validate())
            .reduce((prev, curr, index) => {
                curr.forEach(err => err.location.replace(/<inputIndex>/, index.toString()));
                return prev.concat(curr);
            }));


        // check if ID exists and is valid

        // check if inputs have unique id

        return errors;
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

        this.id      = attr.id;
        this.inputs  = attr.inputs.map(input => new CommandInputParameterModel(input));
        this.outputs = attr.outputs.map(output => new CommandOutputParameterModel(output));

        this.arguments = attr.arguments
            ? attr.arguments.map(arg => new CommandArgumentModel(arg))
            : [];

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

        this.baseCommand = (<Array<string | Expression>> attr.baseCommand)
            .map(cmd => new ExpressionModel(cmd));

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