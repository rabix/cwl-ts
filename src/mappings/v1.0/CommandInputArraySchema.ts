import {InputArraySchema} from "./InputArraySchema";
import {CommandLineBinding} from "./CommandLineBinding";
import {CWLType} from "./CWLType";
import {CommandInputRecordSchema} from "./CommandInputRecordSchema";
import {CommandInputEnumSchema} from "./CommandInputEnumSchema";


export interface CommandInputArraySchema extends InputArraySchema {


    inputBinding?: CommandLineBinding;


    /**
     * Defines the type of the array elements.
     */
    items: CWLType | CommandInputRecordSchema | CommandInputEnumSchema | CommandInputArraySchema | string | Array<CWLType | CommandInputRecordSchema | CommandInputEnumSchema | CommandInputArraySchema | string>;

}