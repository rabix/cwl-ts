import {RecordField} from "./RecordField";
import {JsonldPredicate} from "./JsonldPredicate";


/**
 * A field of a record.
 */

export interface SaladRecordField extends RecordField {


    /**
     * Annotate this type with linked data context.
     *
     */
    jsonldPredicate?: string | JsonldPredicate;

}