import {RecordSchema} from "./RecordSchema";
import {InputSchema} from "./InputSchema";
import {InputRecordField} from "./InputRecordField";


export interface InputRecordSchema extends RecordSchema, InputSchema {


    /**
     * Defines the fields of the record.
     */
    fields?: Array<InputRecordField>;

}