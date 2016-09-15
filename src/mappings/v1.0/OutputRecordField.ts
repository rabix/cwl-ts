import {RecordField} from "./RecordField";
import {OutputBinding} from "./OutputBinding";
import {CWLType} from "./CWLType";
import {OutputRecordSchema} from "./OutputRecordSchema";
import {OutputEnumSchema} from "./OutputEnumSchema";
import {OutputArraySchema} from "./OutputArraySchema";


export interface OutputRecordField extends RecordField {


    outputBinding?: OutputBinding;


    /**
     * The field type
     *
     */
        type: CWLType | OutputRecordSchema | OutputEnumSchema | OutputArraySchema | string | Array<CWLType | OutputRecordSchema | OutputEnumSchema | OutputArraySchema | string>;

}