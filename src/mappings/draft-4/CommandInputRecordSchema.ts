import {InputRecordSchema} from "./InputRecordSchema";


export interface CommandInputRecordSchema extends InputRecordSchema {


    /**
     * Defines the fields of the record.
     */
    fields?: CommandInputRecordField[];

}