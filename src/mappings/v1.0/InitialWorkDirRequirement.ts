import {ProcessRequirement} from "./ProcessRequirement";
import {File} from "./File";
import {Directory} from "./Directory";
import {Dirent} from "./Dirent";
import {Expression} from "./Expression";


/**
 * Define a list of files and subdirectories that must be created by the workflow platform in the designated output directory prior to executing the command line tool.
 */

export interface InitialWorkDirRequirement extends ProcessRequirement {


    /**
     * InitialWorkDirRequirement
     */
        class: string;


    /**
     * The list of files or subdirectories that must be placed in the
     * designated output directory prior to executing the command line tool.
     *
     * May be an expression.  If so, the expression return value must validate
     * as `{type: array, items: [File, Directory]}`.
     *
     */
    listing: Array<File | Directory | Dirent | string | Expression> | string | Expression;

}