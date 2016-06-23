import {OutputRecordSchema} from "./OutputRecordSchema";
import {CommandOutputRecordField} from "./CommandOutputRecordField";


export interface CommandOutputRecordSchema extends OutputRecordSchema {


    /**
     * Defines the fields of the record.
     */
    fields?: Array<CommandOutputRecordField>;

}