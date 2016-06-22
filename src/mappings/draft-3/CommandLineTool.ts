import {Process} from "./Process";
import {CommandLineBinding} from "./CommandLineBinding";
import {Expression} from "./Expression";


/**
 * This defines the schema of the CWL Command Line Tool Description document.
 *
 */

export interface CommandLineTool extends Process {


    class: string;


    /**
     * Specifies the program to execute.  If the value is an array, the first
     * element is the program to execute, and subsequent elements are placed
     * at the beginning of the command line in prior to any command line
     * bindings.  If the program includes a path separator character it must
     * be an absolute path, otherwise it is an error.  If the program does not
     * include a path separator, search the `$PATH` variable in the runtime
     * environment of the workflow runner find the absolute path of the
     * executable.
     *
     */
    baseCommand: string | Array<string>;


    /**
     * Command line bindings which are not directly associated with input parameters.
     *
     */
    arguments?: Array<string | CommandLineBinding>;


    /**
     * A path to a file whose contents must be piped into the command's
     * standard input stream.
     *
     */
    stdin?: string | Expression;


    /**
     * Capture the command's standard output stream to a file written to
     * the designated output directory.
     *
     * If `stdout` is a string, it specifies the file name to use.
     *
     * If `stdout` is an expression, the expression is evaluated and must
     * return a string with the file name to use to capture stdout.  If the
     * return value is not a string, or the resulting path contains illegal
     * characters (such as the path separator `/`) it is an error.
     *
     */
    stdout?: string | Expression;


    /**
     * Exit codes that indicate the process completed successfully.
     *
     */
    successCodes?: Array<number>;


    /**
     * Exit codes that indicate the process failed due to a possibly
     * temporary condition, where excuting the process with the same
     * runtime environment and inputs may produce different results.
     *
     */
    temporaryFailCodes?: Array<number>;


    /**
     * Exit codes that indicate the process failed due to a permanent logic error, where excuting the process with the same runtime environment and same inputs is expected to always fail.
     */
    permanentFailCodes?: Array<number>;

}