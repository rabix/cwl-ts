import {CWLType, SecondaryFileList, IOFormat} from "../Symbols";
import {
    CommandInputArraySchema,
    CommandInputEnumSchema,
    CommandInputRecordSchema
} from "./../schemas";
import {CommandLineBinding} from "../bindings/CommandLineBinding";
import {Parameter} from "./Parameter";

export interface CommandInputParameter extends Parameter {



    type?: string 
        | CWLType
        | CommandInputRecordSchema 
        | CommandInputEnumSchema 
        | CommandInputArraySchema
        | Array<CWLType | CommandInputRecordSchema | CommandInputEnumSchema | CommandInputArraySchema | string>;


    inputBinding?: CommandLineBinding;

    default?: any;
}
