import {PrimitiveType} from "../aggregate-types";
import {InputRecordSchema, InputEnumSchema, InputArraySchema} from "../schemas";
import {CommandLineBinding} from "../bindings";
import {InputArraySchema} from "../schemas/input-array-schema";

export interface InputRecordField {
    name: string;

    type: string
        | PrimitiveType
        | InputRecordSchema
        | InputEnumSchema
        | InputArraySchema
        | Array<PrimitiveType | InputRecordSchema | InputEnumSchema | InputArraySchema | string>;

    doc?: string;

    inputBinding?: CommandLineBinding;
}