import {OutputParameter} from "./OutputParameter";
import {CWLType} from "./CWLType";
import {stdout} from "./stdout";
import {stderr} from "./stderr";
import {CommandOutputRecordSchema} from "./CommandOutputRecordSchema";
import {CommandOutputEnumSchema} from "./CommandOutputEnumSchema";
import {CommandOutputArraySchema} from "./CommandOutputArraySchema";


/**
 * An output parameter for a CommandLineTool.
 */

export interface CommandOutputParameter extends OutputParameter {


    /**
     * Specify valid types of data that may be assigned to this parameter.
     *
     */
        type?: CWLType | stdout | stderr | CommandOutputRecordSchema | CommandOutputEnumSchema | CommandOutputArraySchema | string | Array<CWLType | CommandOutputRecordSchema | CommandOutputEnumSchema | CommandOutputArraySchema | string>;

}