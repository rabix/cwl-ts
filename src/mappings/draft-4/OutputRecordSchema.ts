import {RecordSchema} from "./RecordSchema";
import {OutputSchema} from "./OutputSchema";


export interface OutputRecordSchema extends RecordSchema, OutputSchema {


    /**
     * Defines the fields of the record.
     */
    fields?: OutputRecordField[];

}