import {EnumSchema} from "./EnumSchema";
import {OutputSchema} from "./OutputSchema";
import {OutputBinding} from "./OutputBinding";


export interface OutputEnumSchema extends EnumSchema, OutputSchema {


    outputBinding?: OutputBinding;

}