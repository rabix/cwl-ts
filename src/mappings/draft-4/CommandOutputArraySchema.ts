import {OutputArraySchema} from "./OutputArraySchema";
import {CommandOutputBinding} from "./CommandOutputBinding";
import {PrimitiveType} from "./PrimitiveType";
import {CommandOutputRecordSchema} from "./CommandOutputRecordSchema";
import {CommandOutputEnumSchema} from "./CommandOutputEnumSchema";


export interface CommandOutputArraySchema extends OutputArraySchema {


    outputBinding?: CommandOutputBinding;


    /**
     * Defines the type of the array elements.
     */
    items: PrimitiveType | CommandOutputRecordSchema | CommandOutputEnumSchema | CommandOutputArraySchema | string | Array<PrimitiveType | CommandOutputRecordSchema | CommandOutputEnumSchema | CommandOutputArraySchema | string>;

}