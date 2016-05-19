import {CommandOutputBinding} from "../bindings";
import {PrimitiveType} from "../aggregate-types";
import {
    CommandInputArraySchema,
    CommandInputEnumSchema,
    CommandInputRecordSchema
} from "../schemas";

export interface CommandOutputRecordField {
    name: string;

    type: string
        | PrimitiveType
        | CommandInputRecordSchema
        | CommandInputEnumSchema
        | CommandInputArraySchema
        | Array<PrimitiveType | CommandInputRecordSchema | CommandInputEnumSchema | CommandInputArraySchema | string>;

    doc?: string;

    outputBinding?: CommandOutputBinding;
}