import {Expression} from "./Expression";


/**
 * Define a file that must be placed in the designated output directory
 * prior to executing the command line tool.  May be the result of executing
 * an expression, such as building a configuration file from a template.
 *
 */

export interface FileDef {


    /**
     * The name of the file to create in the output directory.
     */
    filename: string | Expression;


    /**
     * If the value is a string literal or an expression which evaluates to a
     * string, a new file must be created with the string as the file contents.
     *
     * If the value is an expression that evaluates to a File object, this
     * indicates the referenced file should be added to the designated output
     * directory prior to executing the tool.
     *
     * Files added in this way may be read-only, and may be provided
     * by bind mounts or file system links to avoid
     * unnecessary copying of the input file.
     *
     */
    fileContent: string | Expression;

}