import {InputEnumSchema, InputArraySchema, InputRecordSchema} from "../schemas";
import {Requirement} from "./requirement";

export interface SchemaDefRequirement extends Requirement {
    types: Array<InputRecordSchema | InputEnumSchema | InputArraySchema>;
}