import {PrimitiveType} from "../aggregate-types";
import {InputRecordSchema, InputEnumSchema, InputArraySchema} from "../schemas";
import {InputArraySchema} from "../schemas/input-array-schema";
import {CommandInputRecordField} from "./command-input-record-field";

export interface InputRecordField extends CommandInputRecordField {

    type: string
        | PrimitiveType
        | InputRecordSchema
        | InputEnumSchema
        | InputArraySchema
        | Array<PrimitiveType | InputRecordSchema | InputEnumSchema | InputArraySchema | string>;

}