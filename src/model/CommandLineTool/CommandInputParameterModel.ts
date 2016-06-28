import {CommandInputParameter} from "../../mappings/draft-4/CommandInputParameter";
import {CommandLineInjectable} from "../interfaces/CommandLineInjectable";
import {CommandLinePart} from "../helpers/CommandLinePart";
import {CWLType} from "../../mappings/draft-3/CWLType";
import {CommandInputRecordSchema} from "../../mappings/draft-4/CommandInputRecordSchema";
import {CommandInputEnumSchema} from "../../mappings/draft-4/CommandInputEnumSchema";
import {CommandInputArraySchema} from "../../mappings/draft-4/CommandInputArraySchema";
import {CommandLineBinding} from "../../mappings/draft-4/CommandLineBinding";
import {Expression} from "../../mappings/draft-4/Expression";
import {Identifiable} from "../interfaces/Identifiable";


export class CommandInputParameterModel implements CommandInputParameter, CommandLineInjectable, Identifiable {
    id: string;

    type: CWLType | CommandInputRecordSchema | CommandInputEnumSchema | CommandInputArraySchema | string | Array<CWLType | CommandInputRecordSchema | CommandInputEnumSchema | CommandInputArraySchema | string>;
    inputBinding: CommandLineBinding;
    label: string;
    description: string;
    secondaryFiles: string | Expression | Array<string | Expression>;
    format: string | Array<string> | Expression;
    streamable: boolean;

    constructor(attr: any) {
        this.id             = attr.id ? attr.id : null;
        this.type           = attr.type ? attr.type : null;
        this.inputBinding   = attr.inputBinding ? attr.inputBinding : null;
        this.label          = attr.label ? attr.label : null;
        this.description    = attr.description ? attr.description : null;
        this.secondaryFiles = attr.secondaryFiles ? attr.secondaryFiles : null;
        this.format         = attr.format ? attr.format : null;
        this.streamable     = attr.streamable ? attr.streamable : null;
    }

    getCommandPart(job?: any, value?: any, self?: any): CommandLinePart {
        return undefined;
    }
}