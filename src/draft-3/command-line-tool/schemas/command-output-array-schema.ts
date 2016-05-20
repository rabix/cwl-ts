import {CWLType} from "../aggregate-types";
import {CommandOutputRecordSchema} from "./command-output-record-schema.ts";
import {CommandOutputEnumSchema} from "./command-output-enum-schema.ts";
import {CommandOutputBinding} from "../bindings";
import {FileArraySchema} from "./file-array-schema";

export interface CommandOutputArraySchema extends FileArraySchema {
    type: "array";

    items: string
        | CWLType
        | CommandOutputRecordSchema
        | CommandOutputEnumSchema
        | CommandOutputArraySchema
        | Array<CWLType | CommandOutputRecordSchema | CommandOutputEnumSchema | CommandOutputArraySchema | string>;

    outputBinding?: CommandOutputBinding;
}