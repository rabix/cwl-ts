import {InputRecordSchema} from "./InputRecordSchema";
import {CommandInputRecordField} from "./CommandInputRecordField";


export interface CommandInputRecordSchema extends InputRecordSchema {


    /**
     * Defines the fields of the record.
     */
    fields?: CommandInputRecordField[];

}