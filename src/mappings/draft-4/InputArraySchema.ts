import {ArraySchema} from "./ArraySchema";
import {InputSchema} from "./InputSchema";
import {InputBinding} from "./InputBinding";


export interface InputArraySchema extends ArraySchema, InputSchema {


    inputBinding?: InputBinding;

}