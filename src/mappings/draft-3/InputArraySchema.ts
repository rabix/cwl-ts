import {ArraySchema} from "./ArraySchema";
import {InputSchema} from "./InputSchema";
import {InputBinding} from "./InputBinding";
import {PrimitiveType} from "./PrimitiveType";
import {InputRecordSchema} from "./InputRecordSchema";
import {InputEnumSchema} from "./InputEnumSchema";


export interface InputArraySchema extends ArraySchema, InputSchema {


    inputBinding?: InputBinding;


    /**
     * Defines the type of the array elements.
     */
    items: PrimitiveType | InputRecordSchema | InputEnumSchema | InputArraySchema | string | Array<PrimitiveType | InputRecordSchema | InputEnumSchema | InputArraySchema | string>;

}