import {OutputRecordField} from "./OutputRecordField";
import {CommandOutputBinding} from "./CommandOutputBinding";
import {CWLType} from "./CWLType";
import {CommandOutputRecordSchema} from "./CommandOutputRecordSchema";
import {CommandOutputEnumSchema} from "./CommandOutputEnumSchema";
import {CommandOutputArraySchema} from "./CommandOutputArraySchema";


export interface CommandOutputRecordField extends OutputRecordField {


    outputBinding?: CommandOutputBinding;


    /**
     * The field type
     *
     */
        type: CWLType | CommandOutputRecordSchema | CommandOutputEnumSchema | CommandOutputArraySchema | string | Array<CWLType | CommandOutputRecordSchema | CommandOutputEnumSchema | CommandOutputArraySchema | string>;

}