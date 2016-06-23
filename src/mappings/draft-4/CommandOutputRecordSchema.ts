import {OutputRecordSchema} from "./OutputRecordSchema";


export interface CommandOutputRecordSchema extends OutputRecordSchema {


    /**
     * Defines the fields of the record.
     */
    fields?: CommandOutputRecordField[];

}