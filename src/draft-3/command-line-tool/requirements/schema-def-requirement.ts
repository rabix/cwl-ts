import {InputEnumSchema, InputArraySchema, InputRecordSchema} from "../schemas";
import {Requirement} from "./requirement";

export interface SchemaDefRequirement extends Requirement {

    class: "SchemaDefRequirement";

    types: Array<InputRecordSchema | InputEnumSchema | InputArraySchema>;
}