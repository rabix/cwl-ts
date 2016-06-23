import {RecordSchema} from "./RecordSchema";
import {OutputSchema} from "./OutputSchema";
import {OutputRecordField} from "./OutputRecordField";


export interface OutputRecordSchema extends RecordSchema, OutputSchema {


    /**
     * Defines the fields of the record.
     */
    fields?: Array<OutputRecordField>;

}