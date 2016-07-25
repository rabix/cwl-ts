import {WorkflowStepInput} from "./WorkflowStepInput";
import {WorkflowStepOutput} from "./WorkflowStepOutput";
import {ProcessRequirement} from "./ProcessRequirement";
import {Process} from "./Process";
import {ScatterMethod} from "./ScatterMethod";


/**
 * A workflow step is an executable element of a workflow.  It specifies the
 * underlying process implementation (such as `CommandLineTool` or another
 * `Workflow`) in the `run` field and connects the input and output parameters
 * of the underlying process to workflow parameters.
 *
 * # Scatter/gather
 *
 * To use scatter/gather,
 * [ScatterFeatureRequirement](#ScatterFeatureRequirement) must be specified
 * in the workflow or workflow step requirements.
 *
 * A "scatter" operation specifies that the associated workflow step or
 * subworkflow should execute separately over a list of input elements.  Each
 * job making up a scatter operation is independent and may be executed
 * concurrently.
 *
 * The `scatter` field specifies one or more input parameters which will be
 * scattered.  An input parameter may be listed more than once.  The declared
 * type of each input parameter is implicitly wrapped in an array for each
 * time it appears in the `scatter` field.  As a result, upstream parameters
 * which are connected to scattered parameters may be arrays.
 *
 * All output parameter types are also implicitly wrapped in arrays.  Each job
 * in the scatter results in an entry in the output array.
 *
 * If `scatter` declares more than one input parameter, `scatterMethod`
 * describes how to decompose the input into a discrete set of jobs.
 *
 *   * **dotproduct** specifies that each of the input arrays are aligned and one
 *       element taken from each array to construct each job.  It is an error
 *       if all input arrays are not the same length.
 *
 *   * **nested_crossproduct** specifies the Cartesian product of the inputs,
 *       producing a job for every combination of the scattered inputs.  The
 *       output must be nested arrays for each level of scattering, in the
 *       order that the input arrays are listed in the `scatter` field.
 *
 *   * **flat_crossproduct** specifies the Cartesian product of the inputs,
 *       producing a job for every combination of the scattered inputs.  The
 *       output arrays must be flattened to a single level, but otherwise listed in the
 *       order that the input arrays are listed in the `scatter` field.
 *
 * # Subworkflows
 *
 * To specify a nested workflow as part of a workflow step,
 * [SubworkflowFeatureRequirement](#SubworkflowFeatureRequirement) must be
 * specified in the workflow or workflow step requirements.
 *
 */

export interface WorkflowStep {


    /**
     * The unique identifier for this workflow step.
     */
    id: string;


    /**
     * Defines the input parameters of the workflow step.  The process is ready to
     * run when all required input parameters are associated with concrete
     * values.  Input parameters include a schema for each parameter which is
     * used to validate the input object.  It may also be used build a user
     * interface for constructing the input object.
     *
     */
        in: WorkflowStepInput[];


    /**
     * Defines the parameters representing the output of the process.  May be
     * used to generate and/or validate the output object.
     *
     */
    out: Array<string | WorkflowStepOutput>;


    /**
     * Declares requirements that apply to either the runtime environment or the
     * workflow engine that must be met in order to execute this workflow step.  If
     * an implementation cannot satisfy all requirements, or a requirement is
     * listed which is not recognized by the implementation, it is a fatal
     * error and the implementation must not attempt to run the process,
     * unless overridden at user option.
     *
     */
    requirements?: ProcessRequirement[];


    /**
     * Declares hints applying to either the runtime environment or the
     * workflow engine that may be helpful in executing this workflow step.  It is
     * not an error if an implementation cannot satisfy all hints, however
     * the implementation may report a warning.
     *
     */
    hints?: any[];


    /**
     * A short, human-readable label of this process object.
     */
    label?: string;


    /**
     * A long, human-readable description of this process object.
     */
    doc?: string;


    /**
     * Specifies the process to run.
     *
     */
    run: string | Process;


    scatter?: string | string[];


    /**
     * Required if `scatter` is an array of more than one element.
     *
     */
    scatterMethod?: ScatterMethod;

}