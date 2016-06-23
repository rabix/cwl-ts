import {RecordSchema} from "./RecordSchema";
import {InputSchema} from "./InputSchema";


export interface InputRecordSchema extends RecordSchema, InputSchema {


    /**
     * Defines the fields of the record.
     */
    fields?: InputRecordField[];

}