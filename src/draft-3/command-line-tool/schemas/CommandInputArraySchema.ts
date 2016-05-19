import {PrimitiveType} from "../Symbols";
import {CommandInputRecordSchema} from "./CommandInputRecordSchema";
import {CommandInputEnumSchema} from "./CommandInputEnumSchema";
import {CommandLineBinding} from "../bindings/CommandLineBinding";
import {Schema} from "./Schema";
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