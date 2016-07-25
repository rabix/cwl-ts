import {ProcessRequirement} from "./ProcessRequirement";
import {Expression} from "./Expression";


/**
 * Specify basic hardware resource requirements.
 *
 * "min" is the minimum amount of a resource that must be reserved to schedule
 * a job. If "min" cannot be satisfied, the job should not be run.
 *
 * "max" is the maximum amount of a resource that the job shall be permitted
 * to use. If a node has sufficient resources, multiple jobs may be scheduled
 * on a single node provided each job's "max" resource requirements are
 * met. If a job attempts to exceed its "max" resource allocation, an
 * implementation may deny additional resources, which may result in job
 * failure.
 *
 * If "min" is specified but "max" is not, then "max" == "min"
 * If "max" is specified by "min" is not, then "min" == "max".
 *
 * It is an error if max < min.
 *
 * It is an error if the value of any of these fields is negative.
 *
 * If neither "min" nor "max" is specified for a resource, an implementation may provide a default.
 *
 */

export interface ResourceRequirement extends ProcessRequirement {


    /**
     * Always 'ResourceRequirement'
     */
        class: string;


    /**
     * Minimum reserved number of CPU cores
     */
    coresMin?: number | string | Expression;


    /**
     * Maximum reserved number of CPU cores
     */
    coresMax?: number | string | Expression;


    /**
     * Minimum reserved RAM in mebibytes (2**20)
     */
    ramMin?: number | string | Expression;


    /**
     * Maximum reserved RAM in mebibytes (2**20)
     */
    ramMax?: number | string | Expression;


    /**
     * Minimum reserved filesystem based storage for the designated temporary directory, in mebibytes (2**20)
     */
    tmpdirMin?: number | string | Expression;


    /**
     * Maximum reserved filesystem based storage for the designated temporary directory, in mebibytes (2**20)
     */
    tmpdirMax?: number | string | Expression;


    /**
     * Minimum reserved filesystem based storage for the designated output directory, in mebibytes (2**20)
     */
    outdirMin?: number | string | Expression;


    /**
     * Maximum reserved filesystem based storage for the designated output directory, in mebibytes (2**20)
     */
    outdirMax?: number | string | Expression;

}