import {PrimitiveType} from "../aggregate-types";
import {CommandOutputRecordSchema} from "./command-output-record-schema.ts";
import {CommandOutputEnumSchema} from "./command-output-enum-schema.ts";
import {CommandOutputBinding} from "../bindings";
import {Schema} from "./schema";

export interface CommandOutputArraySchema extends Schema {
    type: "array";

    items: string
        | PrimitiveType
        | CommandOutputRecordSchema
        | CommandOutputEnumSchema
        | CommandOutputArraySchema
        | Array<PrimitiveType | CommandOutputRecordSchema | CommandOutputEnumSchema | CommandOutputArraySchema | string>;

    outputBinding?: CommandOutputBinding;
}