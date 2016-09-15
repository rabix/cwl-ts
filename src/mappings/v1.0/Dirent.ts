import {Expression} from "./Expression";


/**
 * Define a file or subdirectory that must be placed in the designated output
 * directory prior to executing the command line tool.  May be the result of
 * executing an expression, such as building a configuration file from a
 * template.
 *
 */

export interface Dirent {


    /**
     * The name of the file or subdirectory to create in the output directory.
     * If `entry` is a File or Directory, this overrides `basename`.  Optional.
     *
     */
    entryname?: string | Expression;


    /**
     * If the value is a string literal or an expression which evaluates to a
     * string, a new file must be created with the string as the file contents.
     *
     * If the value is an expression that evaluates to a `File` object, this
     * indicates the referenced file should be added to the designated output
     * directory prior to executing the tool.
     *
     * If the value is an expression that evaluates to a `Dirent` object, this
     * indicates that the File or Directory in `entry` should be added to the
     * designated output directory with the name in `entryname`.
     *
     * If `writable` is false, the file may be made available using a bind
     * mount or file system link to avoid unnecessary copying of the input
     * file.
     *
     */
    entry: string | Expression;


    /**
     * If true, the file or directory must be writable by the tool.  Changes
     * to the file or directory must be isolated and not visible by any other
     * CommandLineTool process.  This may be implemented by making a copy of
     * the original file or directory.  Default false (files and directories
     * read-only by default).
     *
     */
    writable?: boolean;

}