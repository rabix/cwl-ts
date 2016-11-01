import {
    CommandOutputParameter,
    CWLType,
    RecordSchema,
    EnumSchema,
    ArraySchema,
    CommandOutputBinding,
    Expression
} from "../../mappings/v1.0";
import {Identifiable} from "../interfaces";

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
        this.type           = attr.type;
        this.outputBinding  = attr.outputBinding;
        this.label          = attr.label;
        this.description    = attr.description;
        this.secondaryFiles = attr.secondaryFiles;
        this.format         = attr.format;
        this.streamable     = attr.streamable;
    }
}