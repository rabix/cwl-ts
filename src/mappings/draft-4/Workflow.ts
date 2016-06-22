import {Process} from "./Process";
import {WorkflowStep} from "./WorkflowStep";


/**
 * A workflow describes a set of **steps** and the **dependencies** between
 * those processes.  When a process produces output that will be consumed by a
 * second process, the first process is a dependency of the second process.
 *
 * When there is a dependency, the workflow engine must execute the preceeding
 * process and wait for it to successfully produce output before executing the
 * dependent process.  If two processes are defined in the workflow graph that
 * are not directly or indirectly dependent, these processes are
 * **independent**, and may execute in any order or execute concurrently.  A
 * workflow is complete when all steps have been executed.
 *
 * Dependencies between parameters are expressed using the `source` field on
 * [workflow step input parameters](#WorkflowStepInput) and [workflow output
 * parameters](#WorkflowOutputParameter).
 *
 * The `source` field expresses the dependency of one parameter on another
 * such that when a value is associated with the parameter specified by
 * `source`, that value is propagated to the destination parameter.  When all
 * data links inbound to a given step are fufilled, the step is ready to
 * execute.
 *
 * ## Workflow success and failure
 *
 * A completed process must result in one of `success`, `temporaryFailure` or
 * `permanentFailure` states.  An implementation may choose to retry a process
 * execution which resulted in `temporaryFailure`.  An implementation may
 * choose to either continue running other steps of a workflow, or terminate
 * immediately upon `permanentFailure`.
 *
 * * If any step of a workflow execution results in `permanentFailure`, then the
 * workflow status is `permanentFailure`.
 *
 * * If one or more steps result in `temporaryFailure` and all other steps
 * complete `success` or are not executed, then the workflow status is
 * `temporaryFailure`.
 *
 * * If all workflow steps are executed and complete with `success`, then the workflow
 * status is `success`.
 *
 * # Extensions
 *
 * [ScatterFeatureRequirement](#ScatterFeatureRequirement) and
 * [SubworkflowFeatureRequirement](#SubworkflowFeatureRequirement) are
 * available as standard extensions to core workflow semantics.
 *
 */

export interface Workflow extends Process {


    class: string;


    /**
     * The individual steps that make up the workflow.  Each step is executed when all of its
     * input data links are fufilled.  An implementation may choose to execute
     * the steps in a different order than listed and/or execute steps
     * concurrently, provided that dependencies between steps are met.
     *
     */
    steps: Array<WorkflowStep>;

}