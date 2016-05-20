import {CWLType} from "../aggregate-types";
import {CommandInputRecordSchema} from "./command-input-record-schema";
import {CommandInputEnumSchema} from "./command-input-enum-schema";
import {CommandLineBinding} from "../bindings/command-line-binding";
import {FileArraySchema} from "./file-array-schema";

export interface CommandInputArraySchema extends FileArraySchema {
    type: "array";

    items: string
        | CWLType
        | CommandInputRecordSchema 
        | CommandInputEnumSchema 
        | CommandInputArraySchema 
        | Array<CWLType | CommandInputRecordSchema | CommandInputEnumSchema | CommandInputArraySchema | string>;

    inputBinding?: CommandLineBinding;
}