import {InputArraySchema} from "./InputArraySchema";
import {CommandLineBinding} from "./CommandLineBinding";
import {PrimitiveType} from "./PrimitiveType";
import {CommandInputRecordSchema} from "./CommandInputRecordSchema";
import {CommandInputEnumSchema} from "./CommandInputEnumSchema";


export interface CommandInputArraySchema extends InputArraySchema {


    inputBinding?: CommandLineBinding;


    /**
     * Defines the type of the array elements.
     */
    items: PrimitiveType | CommandInputRecordSchema | CommandInputEnumSchema | CommandInputArraySchema | string | Array<PrimitiveType | CommandInputRecordSchema | CommandInputEnumSchema | CommandInputArraySchema | string>;

}