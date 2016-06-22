import {ProcessRequirement} from "./ProcessRequirement";
import {FileDef} from "./FileDef";


/**
 * Define a list of files that must be created by the workflow
 * platform in the designated output directory prior to executing the command
 * line tool.  See `FileDef` for details.
 *
 */

export interface CreateFileRequirement extends ProcessRequirement {


    /**
     * The list of files.
     */
    fileDef: Array<FileDef>;

}