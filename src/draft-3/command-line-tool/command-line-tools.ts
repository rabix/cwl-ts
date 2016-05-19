import {
    CreateFileRequirement,
    DockerRequirement,
    EnvVarRequirement,
    InlineJavascriptRequirement,
    ResourceRequirement,
    SchemaDefRequirement,
    ShellCommandRequirement,
} from "./requirements";

import {CommandInputParameter, CommandOutputParameter} from "./parameters";
import {CommandLineBinding} from "./bindings";
import {Expression} from "./expression";
import {CWLVersions} from "./aggregate-types";

export interface CommandLineTool {

    /**
     * Defines the input parameters of the process.
     * The process is ready to run when all required input parameters
     * are associated with concrete values. Input parameters include a schema for each
     * parameter which is used to validate the input object.
     * It may also be used to build a user interface for constructing the input object.
     */
    inputs: CommandInputParameter[];

    /**
     * Defines the parameters representing the output of the process.
     * May be used to generate and/or validate the output object.
     */
    outputs: CommandOutputParameter[];

    class: string;

    /**
     * Specifies the program to execute. If the value is an array, the first element is
     * the program to execute, and subsequent elements are placed at the beginning of
     * the command line in prior to any command line bindings. If the program includes a
     * path separator character it must be an absolute path, otherwise it is an error.
     * If the program does not include a path separator, search the $PATH variable in
     * the runtime environment of the workflow runner find the absolute path of the executable.
     */
    baseCommand: string | string[];

    /**
     * The unique identifier for this process object.
     */
    id?: string;

    /**
     * Declares requirements that apply to either the runtime environment or the workflow
     * engine that must be met in order to execute this process. If an implementation cannot
     * satisfy all requirements, or a requirement is listed which is not recognized by the
     * implementation, it is a fatal error and the implementation must not attempt
     * to run the process, unless overridden at user option.
     */
    requirements?: InlineJavascriptRequirement | SchemaDefRequirement
        | DockerRequirement | CreateFileRequirement| EnvVarRequirement
        | ShellCommandRequirement | ResourceRequirement;

    /**
     * Declares hints applying to either the runtime environment or the workflow engine that
     * may be helpful in executing this process. It is not an error if an implementation
     * cannot satisfy all hints, however the implementation may report a warning.
     */
    hints?: any[]

    /**
     * A short, human-readable label of this process object.
     */
    label?: string;

    /**
     * A long, human-readable description of this process object.
     */
    description?: string;

    /**
     * CWL document version
     */
    cwlVersion?: CWLVersions;

    /**
     * Command line bindings which are not directly associated with input parameters.
     */
    arguments?: string[] | CommandLineBinding[];

    /**
     * A path to a file whose contents must be piped into the command's standard input stream.
     */
    stdin?: string | Expression;

    /**
     * Capture the command's standard output stream to a file written to the designated
     * output directory.
     *
     * If stdout is a string, it specifies the file name to use.
     * If stdout is an expression, the expression is evaluated and must return a string
     * with the file name to use to capture stdout.
     *
     * If the return value is not a string, or the resulting path contains illegal characters
     * (such as the path separator /) it is an error.
     */
    stdout?: string | Expression;

    /**
     *
     Exit codes that indicate the process completed successfully.
     */
    successCodes?: number[];

    /**
     * Exit codes that indicate the process failed due to a possibly temporary condition,
     * where excuting the process with the same runtime environment and inputs
     * may produce different results.
     */
    temporaryFailCodes?: number[];

    /**
     * Exit codes that indicate the process failed due to a permanent logic error,
     * where excuting the process with the same runtime environment and same inputs
     * is expected to always fail.
     */
    permanentFailCodes?: number[];
}