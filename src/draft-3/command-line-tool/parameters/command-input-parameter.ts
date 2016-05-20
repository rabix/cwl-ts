import {CWLType} from "../aggregate-types";
import {
    CommandInputArraySchema,
    CommandInputEnumSchema,
    CommandInputRecordSchema
} from "./../schemas";
import {CommandLineBinding} from "../bindings/command-line-binding";
import {Parameter} from "./parameter";

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
