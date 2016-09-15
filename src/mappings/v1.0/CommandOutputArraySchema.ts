import {OutputArraySchema} from "./OutputArraySchema";
import {CommandOutputBinding} from "./CommandOutputBinding";
import {CWLType} from "./CWLType";
import {CommandOutputRecordSchema} from "./CommandOutputRecordSchema";
import {CommandOutputEnumSchema} from "./CommandOutputEnumSchema";


export interface CommandOutputArraySchema extends OutputArraySchema {


    outputBinding?: CommandOutputBinding;


    /**
     * Defines the type of the array elements.
     */
    items: CWLType | CommandOutputRecordSchema | CommandOutputEnumSchema | CommandOutputArraySchema | string | Array<CWLType | CommandOutputRecordSchema | CommandOutputEnumSchema | CommandOutputArraySchema | string>;

}