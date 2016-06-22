import {SchemaBase} from "./SchemaBase";


/**
 * Define an input or output parameter to a process.
 *
 */

export interface Parameter extends SchemaBase {


    /**
     * A short, human-readable label of this parameter object.
     */
    label?: string;


    /**
     * A long, human-readable description of this parameter object.
     */
    description?: string;

}