import {PrimitiveType} from "../Symbols";
import {InputRecordSchema} from "./InputRecordSchema";
import {InputEnumSchema} from "./InputEnumSchema";
import {CommandLineBinding} from "../bindings/CommandLineBinding";
import {Schema} from "./Schema";
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