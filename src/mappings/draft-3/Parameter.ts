import {SchemaBase} from "./SchemaBase";
import {CWLType} from "./CWLType";
import {RecordSchema} from "./RecordSchema";
import {EnumSchema} from "./EnumSchema";
import {ArraySchema} from "./ArraySchema";


/**
 * Define an input or output parameter to a process.
 *
 */

export interface Parameter extends SchemaBase {


    /**
     * Specify valid types of data that may be assigned to this parameter.
     *
     */
        type?: CWLType | RecordSchema | EnumSchema | ArraySchema | string | Array<CWLType | RecordSchema | EnumSchema | ArraySchema | string>;


    /**
     * A short, human-readable label of this parameter object.
     */
    label?: string;


    /**
     * A long, human-readable description of this parameter object.
     */
    description?: string;

}