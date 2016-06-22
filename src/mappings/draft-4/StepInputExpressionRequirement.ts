import {ProcessRequirement} from "./ProcessRequirement";


/**
 * Indicate that the workflow platform must support the `valueFrom` field
 * of [WorkflowStepInput](#WorkflowStepInput).
 *
 */

export interface StepInputExpressionRequirement extends ProcessRequirement {

}