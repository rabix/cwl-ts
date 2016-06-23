import {RecordField} from "./RecordField";
import {InputBinding} from "./InputBinding";
import {PrimitiveType} from "./PrimitiveType";
import {InputRecordSchema} from "./InputRecordSchema";
import {InputEnumSchema} from "./InputEnumSchema";
import {InputArraySchema} from "./InputArraySchema";


export interface InputRecordField extends RecordField {


    inputBinding?: InputBinding;


    /**
     * The field type
     *
     */
        type: PrimitiveType | InputRecordSchema | InputEnumSchema | InputArraySchema | string | Array<PrimitiveType | InputRecordSchema | InputEnumSchema | InputArraySchema | string>;

}