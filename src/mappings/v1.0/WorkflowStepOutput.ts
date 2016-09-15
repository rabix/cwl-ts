/**
 * Associate an output parameter of the underlying process with a workflow
 * parameter.  The workflow parameter (given in the `id` field) be may be used
 * as a `source` to connect with input parameters of other workflow steps, or
 * with an output parameter of the process.
 *
 */

export interface WorkflowStepOutput {


    /**
     * A unique identifier for this workflow output parameter.  This is the
     * identifier to use in the `source` field of `WorkflowStepInput` to
     * connect the output value to downstream parameters.
     *
     */
    id: string;

}