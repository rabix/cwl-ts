import {ProcessRequirement} from "./ProcessRequirement";


/**
 * Indicates that the workflow platform must support multiple inbound data links
 * listed in the `source` field of [WorkflowStepInput](#WorkflowStepInput).
 *
 */

export interface MultipleInputFeatureRequirement extends ProcessRequirement {


    /**
     * Always 'MultipleInputFeatureRequirement'
     */
        class: string;

}