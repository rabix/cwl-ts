import {CommandLineBinding} from "../bindings";
import {CWLType} from "../aggregate-types";
import {
    CommandInputArraySchema,
    CommandInputEnumSchema,
    CommandInputRecordSchema
} from "../schemas";

export interface CommandInputRecordField {
    name: string;

    type: string
        | CWLType
        | CommandInputRecordSchema
        | CommandInputEnumSchema
        | CommandInputArraySchema
        | Array<CWLType | CommandInputRecordSchema | CommandInputEnumSchema | CommandInputArraySchema | string>;

    doc?: string;

    inputBinding?: CommandLineBinding;
}