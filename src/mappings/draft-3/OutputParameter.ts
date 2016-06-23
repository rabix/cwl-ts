import {Parameter} from "./Parameter";
import {OutputBinding} from "./OutputBinding";
import {CWLType} from "./CWLType";
import {OutputRecordSchema} from "./OutputRecordSchema";
import {OutputEnumSchema} from "./OutputEnumSchema";
import {OutputArraySchema} from "./OutputArraySchema";


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


    /**
     * Specify valid types of data that may be assigned to this parameter.
     *
     */
        type?: CWLType | OutputRecordSchema | OutputEnumSchema | OutputArraySchema | string | Array<CWLType | OutputRecordSchema | OutputEnumSchema | OutputArraySchema | string>;

}