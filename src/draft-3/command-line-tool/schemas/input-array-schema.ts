import {CWLType} from "../aggregate-types";
import {InputRecordSchema} from "./input-record-schema";
import {InputEnumSchema} from "./input-enum-schema";
import {CommandInputArraySchema} from "./command-input-array-schema";

export interface InputArraySchema extends CommandInputArraySchema {

    name: string;

    items: string
        | CWLType
        | InputRecordSchema
        | InputEnumSchema
        | InputArraySchema
        | Array<CWLType | InputRecordSchema | InputEnumSchema | InputArraySchema | string>;

}