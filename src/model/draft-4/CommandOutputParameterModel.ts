import {CommandOutputParameter} from "../../mappings/draft-4/CommandOutputParameter";
import {Identifiable} from "../interfaces/Identifiable";
import {CWLType} from "../../mappings/draft-4/CWLType";
import {RecordSchema} from "../../mappings/draft-4/RecordSchema";
import {EnumSchema} from "../../mappings/draft-4/EnumSchema";
import {ArraySchema} from "../../mappings/draft-4/ArraySchema";
import {CommandOutputBinding} from "../../mappings/draft-4/CommandOutputBinding";
import {Expression} from "../../mappings/draft-4/Expression";

export class CommandOutputParameterModel implements CommandOutputParameter, Identifiable {
    type: CWLType|RecordSchema|EnumSchema|ArraySchema|string|Array<CWLType|RecordSchema|EnumSchema|ArraySchema|string>;
    label: string;
    outputBinding: CommandOutputBinding;
    description: string;
    secondaryFiles: string|Expression|Array<string|Expression>;
    format: string|Array<string>|Expression;
    streamable: boolean;
    id: string;

    constructor(attr: any) {
        this.id             = attr.id;
        this.type           = attr.type || null;
        this.outputBinding  = attr.outputBinding || null;
        this.label          = attr.label || null;
        this.description    = attr.description || null;
        this.secondaryFiles = attr.secondaryFiles || null;
        this.format         = attr.format || null;
        this.streamable     = attr.streamable || null;
    }
}