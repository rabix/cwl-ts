import {CommandLineTool, ProcessRequirement, CWLVersion, Expression} from "../../mappings/v1.0/";
import {CommandInputParameterModel} from "./CommandInputParameterModel";
import {CommandOutputParameterModel} from "./CommandOutputParameterModel";
import {CommandLinePart} from "../helpers";
import {JobHelper} from "../helpers/JobHelper";
import {CommandArgumentModel} from "./CommandArgumentModel";
import {CommandLineRunnable} from "../interfaces";
import {CommandLineToolModel} from "../generic/CommandLineToolModel";
import {ensureArray} from "../helpers/utils";

export class V1CommandLineToolModel extends CommandLineToolModel implements CommandLineRunnable {
    constructor(json: any, loc?: string) {
        super(loc);

        this.inputs      = ensureArray(json.inputs, "id", "type").map(input => new CommandInputParameterModel(input));
        this.outputs     = ensureArray(json.outputs, "id", "type").map(output => new CommandOutputParameterModel(output));
        this.baseCommand = ensureArray(json.baseCommand);

        this.id          = json.id;
        this.description = json.description;
        this.label       = json.label;

        this.requirements = json.requirements;
        this.hints        = json.hints;
        this.arguments    = json.arguments.map(arg => new CommandArgumentModel(arg));

        this.stdin  = json.stdin;
        this.stderr = json.stderr;
        this.stdout = json.stdout;

        this.successCodes       = json.successCodes;
        this.temporaryFailCodes = json.temporaryFailCodes;
        this.permanentFailCodes = json.permanentFailCodes;

        this.cwlVersion = json.cwlVersion;
    }

    inputs: Array<CommandInputParameterModel>;
    outputs: Array<CommandOutputParameterModel>;

    id: string;
    requirements: Array<ProcessRequirement>;

    hints: Array<any>;
    label: string;
    description: string;
    cwlVersion: CWLVersion;

    'class': string = 'CommandLineTool';
    baseCommand: string|Array<string>;

    arguments: Array<CommandArgumentModel>;
    stdin: string|Expression;
    stdout: string|Expression;
    stderr: string|Expression;

    successCodes: Array<number>;
    temporaryFailCodes: Array<number>;
    permanentFailCodes: Array<number>;

    generateCommandLine(): string {
        let parts = this.generateCommandLineParts();

        return (<string []> this.baseCommand).concat(parts.map(part => part.value)).join(' ');
    }

    private generateCommandLineParts(job?: any): CommandLinePart[] {

        if (!job) {
            job = JobHelper.getJob(this);
        }

        let allParts: CommandLinePart[] = [];

        allParts.concat(this.inputs.map(input => input.getCommandPart(job, job[input.id])));
        allParts.concat(this.arguments.map(arg => arg.getCommandPart(job)));

        //@todo(maya) add stdin and stdout
        return allParts;
    }

    public toString(): string {
        return JSON.stringify(this, null, 2);
    }
}