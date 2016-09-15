import {ArraySchema} from "./ArraySchema";
import {InputSchema} from "./InputSchema";
import {InputBinding} from "./InputBinding";
import {CWLType} from "./CWLType";
import {InputRecordSchema} from "./InputRecordSchema";
import {InputEnumSchema} from "./InputEnumSchema";


export interface InputArraySchema extends ArraySchema, InputSchema {


    inputBinding?: InputBinding;


    /**
     * Defines the type of the array elements.
     */
    items: CWLType | InputRecordSchema | InputEnumSchema | InputArraySchema | string | Array<CWLType | InputRecordSchema | InputEnumSchema | InputArraySchema | string>;

}