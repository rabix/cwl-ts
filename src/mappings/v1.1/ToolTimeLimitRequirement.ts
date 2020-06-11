import {ProcessRequirement} from "../v1.0/ProcessRequirement";
import {Expression} from "../v1.0/Expression";

/**
 * Set an upper limit on the execution time of a CommandLineTool. A CommandLineTool whose execution duration exceeds
 * the time limit may be preemptively terminated and considered failed. May also be used by batch systems to make
 * scheduling decisions. The execution duration excludes external operations, such as staging of files, pulling a
 * docker image etc, and only counts wall-time for the execution of the command line itself.
 */
export interface ToolTimeLimitRequirement extends ProcessRequirement {

    /**
     * Always 'ToolTimeLimit'
     */
    class: string;


    /**
     * The time limit, in seconds. A time limit of zero means no time limit. Negative time limits are an error.
     */
    timelimit?: number | string | Expression;

}
