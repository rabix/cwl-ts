import {RecordField} from "./RecordField";
import {InputBinding} from "./InputBinding";
import {CWLType} from "./CWLType";
import {InputRecordSchema} from "./InputRecordSchema";
import {InputEnumSchema} from "./InputEnumSchema";
import {InputArraySchema} from "./InputArraySchema";


export interface InputRecordField extends RecordField {


    inputBinding?: InputBinding;


    /**
     * A short, human-readable label of this process object.
     */
    label?: string;


    /**
     * The field type
     *
     */
        type: CWLType | InputRecordSchema | InputEnumSchema | InputArraySchema | string | Array<CWLType | InputRecordSchema | InputEnumSchema | InputArraySchema | string>;

}