import {ArraySchema} from "./ArraySchema";
import {OutputSchema} from "./OutputSchema";
import {OutputBinding} from "./OutputBinding";


export interface OutputArraySchema extends ArraySchema, OutputSchema {


    outputBinding?: OutputBinding;

}