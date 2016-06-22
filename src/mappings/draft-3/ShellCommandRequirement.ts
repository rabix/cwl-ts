import {ProcessRequirement} from "./ProcessRequirement";


/**
 * Modify the behavior of CommandLineTool to generate a single string
 * containing a shell command line.  Each item in the argument list must be
 * joined into a string separated by single spaces and quoted to prevent
 * intepretation by the shell, unless `CommandLineBinding` for that argument
 * contains `shellQuote: false`.  If `shellQuote: false` is specified, the
 * argument is joined into the command string without quoting, which allows
 * the use of shell metacharacters such as `|` for pipes.
 *
 */

export interface ShellCommandRequirement extends ProcessRequirement {

}