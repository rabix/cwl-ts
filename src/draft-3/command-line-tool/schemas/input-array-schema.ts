import {PrimitiveType} from "../aggregate-types";
import {InputRecordSchema} from "./input-record-schema";
import {InputEnumSchema} from "./input-enum-schema";
import {CommandLineBinding} from "../bindings/command-line-binding";
import {Schema} from "./schema";
export interface InputArraySchema extends Schema {
    type: "array";

    items: string
        | PrimitiveType
        | InputRecordSchema
        | InputEnumSchema
        | InputArraySchema
        | Array<PrimitiveType | InputRecordSchema | InputEnumSchema | InputArraySchema | string>;


    inputBinding?: CommandLineBinding;
}