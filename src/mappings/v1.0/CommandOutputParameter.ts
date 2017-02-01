import {OutputParameter} from "./OutputParameter";
import {CWLType} from "./CWLType";
import {stdout} from "./stdout";
import {stderr} from "./stderr";
import {CommandOutputRecordSchema} from "./CommandOutputRecordSchema";
import {CommandOutputEnumSchema} from "./CommandOutputEnumSchema";
import {CommandOutputArraySchema} from "./CommandOutputArraySchema";
import {CommandOutputBinding} from "./CommandOutputBinding";

export type CommandOutputParameterType = CWLType | stdout | stderr | CommandOutputRecordSchema | CommandOutputEnumSchema | CommandOutputArraySchema | string | Array<CWLType | CommandOutputRecordSchema | CommandOutputEnumSchema | CommandOutputArraySchema | string>;

/**
 * An output parameter for a CommandLineTool.
 */

export interface CommandOutputParameter extends OutputParameter {


    /**
     * Specify valid types of data that may be assigned to this parameter.
     *
     */
     type?: CommandOutputParameterType


    /**
     * Describes how to handle the outputs of a process.
     *
     */
    outputBinding?: CommandOutputBinding;

}