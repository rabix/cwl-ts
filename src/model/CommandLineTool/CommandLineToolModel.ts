import {CommandLineTool} from "../../mappings/draft-4/CommandLineTool";
import {ProcessRequirement} from "../../mappings/draft-4/ProcessRequirement";
import {CWLVersions} from "../../mappings/draft-4/CWLVersions";
import {CommandLineBinding} from "../../mappings/draft-4/CommandLineBinding";
import {Expression} from "../../mappings/draft-4/Expression";
import {CommandInputParameterModel} from "./CommandInputParameterModel";
import {CommandOutputParameterModel} from "./CommandOutputParameterModel";
import {CWLCollection} from "./CWLCollection";
import {CommandOutputParameter} from "../../mappings/draft-4/CommandOutputParameter";
import {CommandInputParameter} from "../../mappings/draft-4/CommandInputParameter";
import {CommandLinePart} from "../helpers/CommandLinePart";

export class CommandLineToolModel implements CommandLineTool {
    inputs: Array<CommandInputParameter>;
    outputs: Array<CommandOutputParameter>;

    id: string;
    requirements: Array<ProcessRequirement>;

    mappedInputs: CWLCollection<CommandInputParameterModel>;
    mappedOutputs: CWLCollection<CommandOutputParameterModel>;

    hints: Array<any>;
    label: string;
    description: string;
    cwlVersion: CWLVersions;

    class: string = 'CommandLineTool';
    baseCommand: string|Array<string>;


    arguments: Array<string|CommandLineBinding>;
    stdin: string|Expression;
    stdout: string|Expression;
    successCodes: Array<number>;
    temporaryFailCodes: Array<number>;
    permanentFailCodes: Array<number>;

    generateCommandLine(): string {
        let parts = this.generateCommandLineParts();
        parts.sort((a, b) => {
            let posA = a.sortingKey[0];
            let posB = b.sortingKey[0];
            if (posA > posB) { return 1; }
            if (posA < posB) { return -1; }

            let indA = a.sortingKey[1];
            let indB = b.sortingKey[1];

            if (indA > indB) { return 1; }
            if (indA < indB) { return -1; }

            // defaults to returning 1 in case both position and index match (should never happen)
            return 1;
        });

        return parts.map(part => part.value).join(' ');
    }

    private generateCommandLineParts(): CommandLinePart[] {

        // let argParts = this.arguments.map(arg => arg.getCommandPart());
        let inputParts = this.mappedInputs.map(input => input.getCommandPart());

        return inputParts;
    }

}