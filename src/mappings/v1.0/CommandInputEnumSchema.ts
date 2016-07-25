import {InputEnumSchema} from "./InputEnumSchema";
import {CommandLineBinding} from "./CommandLineBinding";


export interface CommandInputEnumSchema extends InputEnumSchema {


    inputBinding?: CommandLineBinding;

}