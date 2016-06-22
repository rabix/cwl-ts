import {ProcessRequirement} from "./ProcessRequirement";


/**
 * Indicates that the workflow platform must support nested workflows in
 * the `run` field of (WorkflowStep)(#WorkflowStep).
 *
 */

export interface SubworkflowFeatureRequirement extends ProcessRequirement {

}