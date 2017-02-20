import {InputParameter} from "./InputParameter";
import {CWLType} from "./CWLType";
import {CommandInputRecordSchema} from "./CommandInputRecordSchema";
import {CommandInputEnumSchema} from "./CommandInputEnumSchema";
import {CommandInputArraySchema} from "./CommandInputArraySchema";
import {CommandLineBinding} from "./CommandLineBinding";


export type CommandInputParameterType = CWLType | CommandInputRecordSchema | CommandInputEnumSchema | CommandInputArraySchema | string | Array<CWLType | CommandInputRecordSchema | CommandInputEnumSchema | CommandInputArraySchema | string>;
/**
 * An input parameter for a CommandLineTool.
 */

export interface CommandInputParameter extends InputParameter {


    /**
     * Specify valid types of data that may be assigned to this parameter.
     *
     */
     type?: CommandInputParameterType;


    /**
     * Describes how to handle the inputs of a process and convert them
     * into a concrete form for execution, such as command line parameters.
     *
     */
    inputBinding?: CommandLineBinding;

}