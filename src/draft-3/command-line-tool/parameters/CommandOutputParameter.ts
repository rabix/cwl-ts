import {SecondaryFileList, IOFormat, CWLType} from "../Symbols";
import {CommandOutputBinding} from "../bindings";
import {
    CommandOutputRecordSchema,
    CommandOutputArraySchema,
    CommandOutputEnumSchema
} from "../schemas";
import {Parameter} from "./Parameter";

export interface CommandOutputParameter extends Parameter {

    type?: string
        | CWLType
        | CommandOutputRecordSchema
        | CommandOutputEnumSchema
        | CommandOutputArraySchema
        | Array<CWLType | CommandOutputRecordSchema | CommandOutputEnumSchema | CommandOutputArraySchema | string>;


    outputBinding?: CommandOutputBinding;
}