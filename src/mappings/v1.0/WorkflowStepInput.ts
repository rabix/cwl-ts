import {Sink} from "./Sink";
import {Expression} from "./Expression";


/**
 * The input of a workflow step connects an upstream parameter (from the
 * workflow inputs, or the outputs of other workflows steps) with the input
 * parameters of the underlying step.
 *
 * ## Input object
 *
 * A WorkflowStepInput object must contain an `id` field in the form
 * `#fieldname` or `#stepname.fieldname`.  When the `id` field contains a
 * period `.` the field name consists of the characters following the final
 * period.  This defines a field of the workflow step input object with the
 * value of the `source` parameter(s).
 *
 * ## Merging
 *
 * To merge multiple inbound data links,
 * [MultipleInputFeatureRequirement](#MultipleInputFeatureRequirement) must be specified
 * in the workflow or workflow step requirements.
 *
 * If the sink parameter is an array, or named in a [workflow
 * scatter](#WorkflowStep) operation, there may be multiple inbound data links
 * listed in the `source` field.  The values from the input links are merged
 * depending on the method specified in the `linkMerge` field.  If not
 * specified, the default method is "merge_nested".
 *
 * * **merge_nested**
 *
 *   The input must be an array consisting of exactly one entry for each
 *   input link.  If "merge_nested" is specified with a single link, the value
 *   from the link must be wrapped in a single-item list.
 *
 * * **merge_flattened**
 *
 *   1. The source and sink parameters must be compatible types, or the source
 *      type must be compatible with single element from the "items" type of
 *      the destination array parameter.
 *   2. Source parameters which are arrays are concatenated.
 *      Source parameters which are single element types are appended as
 *      single elements.
 *
 */

export interface WorkflowStepInput extends Sink {


    /**
     * A unique identifier for this workflow input parameter.
     */
    id: string;


    /**
     * The default value for this parameter if there is no `source`
     * field.
     *
     */
        default?: any;


    /**
     * To use valueFrom, [StepInputExpressionRequirement](#StepInputExpressionRequirement) must
     * be specified in the workflow or workflow step requirements.
     *
     * If `valueFrom` is a constant string value, use this as the value for
     * this input parameter.
     *
     * If `valueFrom` is a parameter reference or expression, it must be
     * evaluated to yield the actual value to be assiged to the input field.
     *
     * The `self` value of in the parameter reference or expression must be
     * the value of the parameter(s) specified in the `source` field, or
     * null if there is no `source` field.
     *
     * The value of `inputs` in the parameter reference or expression must be
     * the input object to the workflow step after assigning the `source`
     * values and then scattering.  The order of evaluating `valueFrom` among
     * step input parameters is undefined and the result of evaluating
     * `valueFrom` on a parameter must not be visible to evaluation of
     * `valueFrom` on other parameters.
     *
     */
    valueFrom?: string | Expression;

}