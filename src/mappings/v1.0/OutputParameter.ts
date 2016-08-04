import {Parameter} from "./Parameter";
import {OutputBinding} from "./OutputBinding";


export interface OutputParameter extends Parameter {


    /**
     * The unique identifier for this parameter object.
     */
    id: string;


    /**
     * Describes how to handle the outputs of a process.
     *
     */
    outputBinding?: OutputBinding;

}