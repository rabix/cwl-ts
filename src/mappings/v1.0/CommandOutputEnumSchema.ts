import {OutputEnumSchema} from "./OutputEnumSchema";
import {CommandOutputBinding} from "./CommandOutputBinding";


export interface CommandOutputEnumSchema extends OutputEnumSchema {


    outputBinding?: CommandOutputBinding;

}