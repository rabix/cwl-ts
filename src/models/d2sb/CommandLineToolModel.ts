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

export class CommandLineToolModel implements CommandLineTool, CommandLineRunnable {
    job: any;
    jobInputs: any;

    inputs: Array<CommandInputParameterModel>;
    outputs: Array<CommandOutputParameterModel>;
    class;
    baseCommand: string|Expression|Array<string|Expression>;

    arguments: Array<CommandArgumentModel>;

    stdin: string | Expression;
    stdout: string | Expression;

    successCodes: number[];
    temporaryFailCodes: number[];
    permanentFailCodes: number[];

    constructor(attr: CommandLineTool | any) {
        this.class     = "CommandLineTool";

        this.inputs    = attr.inputs.map(input => new CommandInputParameterModel(input));
        this.outputs   = attr.outputs.map(output => new CommandOutputParameterModel(output));

        this.arguments = attr.arguments
                        ? attr.arguments.map(arg => new CommandArgumentModel(arg))
                        : [];

        this.baseCommand = attr.baseCommand;
        this.stdin       = attr.stdin || '';
        this.stdout      = attr.stdout || '';

        this.successCodes       = attr.successCodes || [];
        this.temporaryFailCodes = attr.temporaryFailCodes || [];
        this.permanentFailCodes = attr.permanentFailCodes || [];

        if (!Array.isArray(this.baseCommand)) {
            this.baseCommand = [<string | Expression> this.baseCommand]
        }

        this.job = attr['sbg:job']
                    ? attr['sbg:job']
                    : JobHelper.getJob(this);

        this.jobInputs = this.job.inputs || this.job;
    }

    public getCommandLine(): string {
        const parts = this.getCommandLineParts()
            .filter(part => part !== null)
            .map(part => part.value)
            .join(' ');

        const baseCmdParts = (<Array<string | Expression>> this.baseCommand)
            .map((baseCmd) => {
                if (typeof baseCmd === 'string') {
                    return baseCmd;
                } else {
                    return ExpressionEvaluator.evaluateD2(baseCmd, this.job);
                }
            });


        return baseCmdParts.concat(parts).join(' ').trim();
    }

    private getCommandLineParts(): CommandLinePart[] {
        const inputParts = this.inputs.map(input => {
            const normalizedId = input.id.charAt(0) === '#'
                ? input.id.substring(1)
                : input.id;
            const jobInput = this.jobInputs[normalizedId];
            return input.getCommandPart(this.job, jobInput);
        });
        const argParts   = this.arguments.map(arg => arg.getCommandPart(this.job));
        const concat     = inputParts.concat(argParts).filter(item => item !== null);

        MSDSort.sort(concat);

        return concat;
    }

    public setJob(job: any) {
        this.job = job;
        this.jobInputs = this.job.inputs || this.job;
    }
}