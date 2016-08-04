import {ArraySchema} from "./ArraySchema";
import {OutputSchema} from "./OutputSchema";
import {OutputBinding} from "./OutputBinding";
import {CWLType} from "./CWLType";
import {OutputRecordSchema} from "./OutputRecordSchema";
import {OutputEnumSchema} from "./OutputEnumSchema";


export interface OutputArraySchema extends ArraySchema, OutputSchema {


    outputBinding?: OutputBinding;


    /**
     * Defines the type of the array elements.
     */
    items: CWLType | OutputRecordSchema | OutputEnumSchema | OutputArraySchema | string | Array<CWLType | OutputRecordSchema | OutputEnumSchema | OutputArraySchema | string>;

}