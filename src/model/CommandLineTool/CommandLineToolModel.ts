import {CommandLineTool} from "../../mappings/draft-4/CommandLineTool";
import {ProcessRequirement} from "../../mappings/draft-4/ProcessRequirement";
import {CWLVersions} from "../../mappings/draft-4/CWLVersions";
import {CommandLineBinding} from "../../mappings/draft-4/CommandLineBinding";
import {Expression} from "../../mappings/draft-4/Expression";
import {CommandInputParameterModel} from "./CommandInputParameterModel";
import {CommandOutputParameterModel} from "./CommandOutputParameterModel";
import {CommandLinePart} from "../helpers/CommandLinePart";
import {JobHelper} from "../helpers/JobHelper";

export class CommandLineToolModel implements CommandLineTool {
    constructor(json: any) {
        function objToArr(obj) {
            let arr = [];
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    obj[key].id = key;
                    arr.push(obj[key]);
                }
            }
            return arr;
        }

        if (!Array.isArray(json.inputs)) {
            json.inputs = objToArr(json.inputs);
        }

        if (!Array.isArray(json.outputs)) {
            json.outputs = objToArr(json.outputs);
        }

        this.inputs      = json.inputs.map(input => new CommandInputParameterModel(input));
        this.outputs     = json.outputs.map(output => new CommandOutputParameterModel(output));
        this.baseCommand = json.baseCommand;

        this.id          = json.id || null;
        this.description = json.description || null;
        this.label       = json.label || null;

        this.requirements = json.requirements || null;
        this.hints        = json.hints || null;
        this.arguments    = json.arguments || null;

        this.stdin  = json.stdin || null;
        this.stderr = json.stderr || null;
        this.stdout = json.stdout || null;

        this.successCodes       = json.successCodes || null;
        this.temporaryFailCodes = json.temporaryFailCodes || null;
        this.permanentFailCodes = json.permanentFailCodes || null;

        this.cwlVersion = json.cwlVersion || null;
    }

    inputs: Array<CommandInputParameterModel>;
    outputs: Array<CommandOutputParameterModel>;

    id: string;
    requirements: Array<ProcessRequirement>;

    hints: Array<any>;
    label: string;
    description: string;
    cwlVersion: CWLVersions;

    'class': string = 'CommandLineTool';
    baseCommand: string|Array<string>;


    arguments: Array<string|CommandLineBinding>;
    stdin: string|Expression;
    stdout: string|Expression;
    stderr: string|Expression;

    successCodes: Array<number>;
    temporaryFailCodes: Array<number>;
    permanentFailCodes: Array<number>;

    generateCommandLine(): string {
        let parts = this.generateCommandLineParts();
        parts.sort((a, b) => {
            let posA = a.sortingKey[0];
            let posB = b.sortingKey[0];
            if (posA > posB) {
                return 1;
            }
            if (posA < posB) {
                return -1;
            }

            let indA = a.sortingKey[1];
            let indB = b.sortingKey[1];

            if (indA > indB) {
                return 1;
            }
            if (indA < indB) {
                return -1;
            }

            // defaults to returning 1 in case both position and index match (should never happen)
            return 1;
        });

        return parts.map(part => part.value).join(' ');
    }

    private generateCommandLineParts(job?: any): CommandLinePart[] {

        if (!job) {
            job = JobHelper.getJob(this);
        }

        // let argParts = this.arguments.map(arg => arg.getCommandPart());

        return this.inputs.map(input => input.getCommandPart(job, job[input.id]));
    }

    public toString(): string {
        return JSON.stringify(this, null, 2);
    }
}