import {CommandLineTool, Expression, ProcessRequirement} from "../../mappings/v1.0/";
import {V1CommandInputParameterModel} from "./V1CommandInputParameterModel";
import {V1CommandOutputParameterModel} from "./V1CommandOutputParameterModel";
import {CommandArgumentModel} from "./CommandArgumentModel";
import {CommandLineToolModel} from "../generic/CommandLineToolModel";
import {ensureArray} from "../helpers/utils";
import {V1ExpressionModel} from "./V1ExpressionModel";

export class V1CommandLineToolModel extends CommandLineToolModel {
    public cwlVersion = "v1.0";

    inputs: Array<V1CommandInputParameterModel>;
    outputs: Array<V1CommandOutputParameterModel>;

    id: string;
    requirements: Array<ProcessRequirement>;

    hints: Array<any>;
    label: string;
    description: string;

    'class': string = 'CommandLineTool';
    baseCommand: Array<V1ExpressionModel>;

    arguments: Array<CommandArgumentModel>;
    stdin: string|Expression;
    stdout: string|Expression;
    stderr: string|Expression;

    successCodes: Array<number>;
    temporaryFailCodes: Array<number>;
    permanentFailCodes: Array<number>;

    constructor(json: any, loc?: string) {
        super(loc);

        this.inputs      = ensureArray(json.inputs, "id", "type").map(input => new V1CommandInputParameterModel(input));
        this.outputs     = ensureArray(json.outputs, "id", "type").map(output => new V1CommandOutputParameterModel(output));
        this.baseCommand = ensureArray(json.baseCommand).map((cmd, index) => new V1ExpressionModel(cmd, `${this.loc}.baseCommand[${index}]`));

        this.id          = json.id;
        this.description = json.description;
        this.label       = json.label;

        this.requirements = json.requirements;
        this.hints        = json.hints;
        this.arguments    = ensureArray(json.arguments).map(arg => new CommandArgumentModel(arg));

        this.stdin  = json.stdin;
        this.stderr = json.stderr;
        this.stdout = json.stdout;

        this.successCodes       = json.successCodes;
        this.temporaryFailCodes = json.temporaryFailCodes;
        this.permanentFailCodes = json.permanentFailCodes;
    }

    // generateCommandLine(): string {
    //     let parts = this.generateCommandLineParts();
    //
    //     return (<string []> this.baseCommand).concat(parts.map(part => part.value)).join(' ');
    // }

    // private generateCommandLineParts(job?: any): CommandLinePart[] {
    //
    //     if (!job) {
    //         job = JobHelper.getJob(this);
    //     }
    //
    //     let allParts: CommandLinePart[] = [];
    //
    //     allParts.concat(this.inputs.map(input => input.getCommandPart(job, job[input.id])));
    //     allParts.concat(this.arguments.map(arg => arg.getCommandPart(job)));
    //
    //     //@todo(maya) add stdin and stdout
    //     return allParts;
    // }
}