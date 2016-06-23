import {OutputParameter} from "./OutputParameter";
import {CommandOutputBinding} from "./CommandOutputBinding";
import {CWLType} from "./CWLType";
import {CommandOutputRecordSchema} from "./CommandOutputRecordSchema";
import {CommandOutputEnumSchema} from "./CommandOutputEnumSchema";
import {CommandOutputArraySchema} from "./CommandOutputArraySchema";


/**
 * An output parameter for a CommandLineTool.
 */

export interface CommandOutputParameter extends OutputParameter {


    /**
     * Describes how to handle the outputs of a process.
     *
     */
    outputBinding?: CommandOutputBinding;


    /**
     * Specify valid types of data that may be assigned to this parameter.
     *
     */
        type?: CWLType | CommandOutputRecordSchema | CommandOutputEnumSchema | CommandOutputArraySchema | string | Array<CWLType | CommandOutputRecordSchema | CommandOutputEnumSchema | CommandOutputArraySchema | string>;

}