import {OutputRecordField} from "./OutputRecordField";
import {CommandOutputBinding} from "./CommandOutputBinding";
import {PrimitiveType} from "./PrimitiveType";
import {CommandOutputRecordSchema} from "./CommandOutputRecordSchema";
import {CommandOutputEnumSchema} from "./CommandOutputEnumSchema";
import {CommandOutputArraySchema} from "./CommandOutputArraySchema";


export interface CommandOutputRecordField extends OutputRecordField {


    outputBinding?: CommandOutputBinding;


    /**
     * The field type
     *
     */
        type: PrimitiveType | CommandOutputRecordSchema | CommandOutputEnumSchema | CommandOutputArraySchema | string | Array<PrimitiveType | CommandOutputRecordSchema | CommandOutputEnumSchema | CommandOutputArraySchema | string>;

}