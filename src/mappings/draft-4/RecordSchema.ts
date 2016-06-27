import {RecordField} from "./RecordField";
export interface RecordSchema {


    /**
     * Must be `record`
     */
        type: "record";


    /**
     * Defines the fields of the record.
     */
    fields?: RecordField[];

}