import {CWLType} from "../aggregate-types";
import {InputRecordSchema} from "./input-record-schema";
import {InputEnumSchema} from "./input-enum-schema";
import {CommandLineBinding} from "../bindings/command-line-binding";
import {FileArraySchema} from "./file-array-schema";

export interface InputArraySchema extends FileArraySchema {

    name: string;

    type: "array";

    items: string
        | CWLType
        | InputRecordSchema
        | InputEnumSchema
        | InputArraySchema
        | Array<CWLType | InputRecordSchema | InputEnumSchema | InputArraySchema | string>;


    inputBinding?: CommandLineBinding;
}