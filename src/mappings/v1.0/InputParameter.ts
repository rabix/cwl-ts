import {Parameter} from "./Parameter";
import {InputBinding} from "./InputBinding";
import {CWLType} from "./CWLType";
import {InputRecordSchema} from "./InputRecordSchema";
import {InputEnumSchema} from "./InputEnumSchema";
import {InputArraySchema} from "./InputArraySchema";
import {Expression} from "./Expression";


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


    /**
     * Only valid when type: File or is an array of items: File.
     * For input parameters, this must be one or more IRIs of concept nodes that represents file
     * formats which are allowed as input to this parameter, preferably defined within an ontology.
     * If no ontology is available, file formats may be tested by exact match.
     *
     * For output parameters, this is the file format that will be assigned to the output parameter.
     */

    format?: string | string[] | Expression;
}