import {FileDef} from "./FileDef";
import {File} from "./File";
import {Directory} from "./Directory";


/**
 * Setup a working directory based on a number of input files (and/or directories)
 *
 */

export interface initialWorkDir {


    /**
     * list of files and/or directories
     */
    dirDef: Array<FileDef | File | Directory>;

}