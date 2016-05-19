import {InputEnumSchema, InputArraySchema, InputRecordSchema} from "../schemas";
import {BaseRequirement} from "./BaseRequirement";

export interface SchemaDefRequirement extends BaseRequirement {
    types: Array<InputRecordSchema | InputEnumSchema | InputArraySchema>;
}