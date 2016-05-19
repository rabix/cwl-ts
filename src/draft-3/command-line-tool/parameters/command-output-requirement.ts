import {CWLType} from "../aggregate-types";
import {CommandOutputBinding} from "../bindings";
import {
    CommandOutputRecordSchema,
    CommandOutputArraySchema,
    CommandOutputEnumSchema
} from "../schemas";
import {Parameter} from "./parameter";

export interface CommandOutputParameter extends Parameter {

    type?: string
        | CWLType
        | CommandOutputRecordSchema
        | CommandOutputEnumSchema
        | CommandOutputArraySchema
        | Array<CWLType | CommandOutputRecordSchema | CommandOutputEnumSchema | CommandOutputArraySchema | string>;


    outputBinding?: CommandOutputBinding;
}