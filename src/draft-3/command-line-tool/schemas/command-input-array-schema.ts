import {CWLType} from "../aggregate-types";
import {CommandInputRecordSchema} from "./command-input-record-schema";
import {CommandInputEnumSchema} from "./command-input-enum-schema";
import {CommandLineBinding} from "../bindings/command-line-binding";
import {FileSchemaOptional} from "./file-schema-optional";

export interface CommandInputArraySchema extends FileSchemaOptional {
    type: "array";

    items: string
        | CWLType
        | CommandInputRecordSchema 
        | CommandInputEnumSchema 
        | CommandInputArraySchema 
        | Array<CWLType | CommandInputRecordSchema | CommandInputEnumSchema | CommandInputArraySchema | string>;

    inputBinding?: CommandLineBinding;
}