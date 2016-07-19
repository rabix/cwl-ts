import {CommandArgumentModel} from "./CommandArgumentModel";
import {CommandInputParameterModel} from "./CommandInputParameterModel";
import {CommandLinePart} from "../helpers/CommandLinePart";
import {CommandLineTool} from "../../mappings/d2sb/CommandLineTool";
import {CommandOutputParameterModel} from "./CommandOutputParameterModel";
import {Expression} from "../../mappings/d2sb/Expression";
import {JobHelper} from "../helpers/JobHelper";
import {CommandLineRunnable} from "../interfaces/CommandLineRunnable";

export class CommandLineToolModel implements CommandLineTool, CommandLineRunnable {
    job: any;

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


    constructor(attr: CommandLineTool) {
        this.class     = "CommandLineTool";
        this.inputs    = attr.inputs.map(input => new CommandInputParameterModel(input));
        this.outputs   = attr.outputs.map(output => new CommandOutputParameterModel(output));
        this.arguments = attr.arguments ? attr.arguments.map(arg => new CommandArgumentModel(arg)) : [];

        this.baseCommand = attr.baseCommand;
        this.stdin       = attr.stdin || '';
        this.stdout      = attr.stdout || '';

        this.successCodes       = attr.successCodes || [];
        this.temporaryFailCodes = attr.temporaryFailCodes || [];
        this.permanentFailCodes = attr.permanentFailCodes || [];

        this.job = attr['sbg:job'] ? attr['sbg:job'] : JobHelper.getJob(this);

    }

    getCommandLine(): string {
        return this.getCommandLineParts().map(part => part.value).join(' ');
    }

    getCommandLineParts(): CommandLinePart[] {
        return this.inputs.map(input => input.getCommandPart(this.job)).concat(
            this.arguments.map(arg => arg.getCommandPart(this.job))
        )
    }
}