import {PrimitiveType} from "../aggregate-types";
import {CommandInputRecordSchema} from "./command-input-record-schema";
import {CommandInputEnumSchema} from "./command-input-enum-schema";
import {CommandLineBinding} from "../bindings/command-line-binding";
import {Schema} from "./schema";
export interface CommandInputArraySchema extends Schema {
    type: "array";

    items: string
        | PrimitiveType 
        | CommandInputRecordSchema 
        | CommandInputEnumSchema 
        | CommandInputArraySchema 
        | Array<PrimitiveType | CommandInputRecordSchema | CommandInputEnumSchema | CommandInputArraySchema | string>;

    inputBinding?: CommandLineBinding;
}