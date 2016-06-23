import {ArraySchema} from "./ArraySchema";
import {OutputSchema} from "./OutputSchema";
import {OutputBinding} from "./OutputBinding";
import {PrimitiveType} from "./PrimitiveType";
import {OutputRecordSchema} from "./OutputRecordSchema";
import {OutputEnumSchema} from "./OutputEnumSchema";


export interface OutputArraySchema extends ArraySchema, OutputSchema {


    outputBinding?: OutputBinding;


    /**
     * Defines the type of the array elements.
     */
    items: PrimitiveType | OutputRecordSchema | OutputEnumSchema | OutputArraySchema | string | Array<PrimitiveType | OutputRecordSchema | OutputEnumSchema | OutputArraySchema | string>;

}