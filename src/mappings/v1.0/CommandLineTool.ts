import {Process} from "./Process";
import {Expression} from "./Expression";
import {CommandLineBinding} from "./CommandLineBinding";
import {CommandInputParameter} from "./CommandInputParameter";
import {CommandOutputParameter} from "./CommandOutputParameter";


/**
 * This defines the schema of the CWL Command Line Tool Description document.
 *
 */

export interface CommandLineTool extends Process {


    class: string;


    /**
     * Specifies the program to execute.  If an array, the first element of
     * the array is the command to execute, and subsequent elements are
     * mandatory command line arguments.  The elements in `baseCommand` must
     * appear before any command line bindings from `inputBinding` or
     * `arguments`.
     *
     * If `baseCommand` is not provided or is an empty array, the first
     * element of the command line produced after processing `inputBinding` or
     * `arguments` must be used as the program to execute.
     *
     * If the program includes a path separator character it must
     * be an absolute path, otherwise it is an error.  If the program does not
     * include a path separator, search the `$PATH` variable in the runtime
     * environment of the workflow runner find the absolute path of the
     * executable.
     *
     */
    baseCommand?: string | string[];


    /**
     * Command line bindings which are not directly associated with input parameters.
     *
     */
    arguments?: Array<string | Expression | CommandLineBinding>;


    /**
     * A path to a file whose contents must be piped into the command's
     * standard input stream.
     *
     */
    stdin?: string | Expression;


    /**
     * Capture the command's standard error stream to a file written to
     * the designated output directory.
     *
     * If `stderr` is a string, it specifies the file name to use.
     *
     * If `stderr` is an expression, the expression is evaluated and must
     * return a string with the file name to use to capture stderr.  If the
     * return value is not a string, or the resulting path contains illegal
     * characters (such as the path separator `/`) it is an error.
     *
     */
    stderr?: string | Expression;


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
    successCodes?: number[];


    /**
     * Exit codes that indicate the process failed due to a possibly
     * temporary condition, where executing the process with the same
     * runtime environment and inputs may produce different results.
     *
     */
    temporaryFailCodes?: number[];


    /**
     * Exit codes that indicate the process failed due to a permanent logic error, where executing the process with the same runtime environment and same inputs is expected to always fail.
     */
    permanentFailCodes?: number[];


    /**
     * Defines the input parameters of the process.  The process is ready to
     * run when all required input parameters are associated with concrete
     * values.  Input parameters include a schema for each parameter which is
     * used to validate the input object.  It may also be used to build a user
     * interface for constructing the input object.
     *
     */
    inputs: Array<CommandInputParameter>;


    /**
     * Defines the parameters representing the output of the process.  May be
     * used to generate and/or validate the output object.
     *
     */
    outputs: Array<CommandOutputParameter>;

}