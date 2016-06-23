import {RecordField} from "./RecordField";
import {OutputBinding} from "./OutputBinding";
import {PrimitiveType} from "./PrimitiveType";
import {OutputRecordSchema} from "./OutputRecordSchema";
import {OutputEnumSchema} from "./OutputEnumSchema";
import {OutputArraySchema} from "./OutputArraySchema";


export interface OutputRecordField extends RecordField {


    outputBinding?: OutputBinding;


    /**
     * The field type
     *
     */
        type: PrimitiveType | OutputRecordSchema | OutputEnumSchema | OutputArraySchema | string | Array<PrimitiveType | OutputRecordSchema | OutputEnumSchema | OutputArraySchema | string>;

}