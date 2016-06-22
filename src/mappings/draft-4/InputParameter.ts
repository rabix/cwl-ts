import {Parameter} from "./Parameter";
import {InputBinding} from "./InputBinding";
import {CWLType} from "./CWLType";
import {InputRecordSchema} from "./InputRecordSchema";
import {InputEnumSchema} from "./InputEnumSchema";
import {InputArraySchema} from "./InputArraySchema";


export interface InputParameter extends Parameter {


    /**
     * The unique identifier for this parameter object.
     */
    id: string;


    /**
     * Describes how to handle the inputs of a process and convert them
     * into a concrete form for execution, such as command line parameters.
     *
     */
    inputBinding?: InputBinding;


    /**
     * The default value for this parameter if not provided in the input
     * object.
     *
     */
        default?: any;


    /**
     * Specify valid types of data that may be assigned to this parameter.
     *
     */
        type?: CWLType | InputRecordSchema | InputEnumSchema | InputArraySchema | string | Array<CWLType | InputRecordSchema | InputEnumSchema | InputArraySchema | string>;

}