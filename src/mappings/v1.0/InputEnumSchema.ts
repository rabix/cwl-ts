import {EnumSchema} from "./EnumSchema";
import {InputSchema} from "./InputSchema";
import {InputBinding} from "./InputBinding";


export interface InputEnumSchema extends EnumSchema, InputSchema {


    inputBinding?: InputBinding;

}