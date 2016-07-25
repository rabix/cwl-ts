import {OutputParameter} from "./OutputParameter";
import {LinkMergeMethod} from "./LinkMergeMethod";
import {CWLType} from "./CWLType";
import {OutputRecordSchema} from "./OutputRecordSchema";
import {OutputEnumSchema} from "./OutputEnumSchema";
import {OutputArraySchema} from "./OutputArraySchema";


/**
 * Describe an output parameter of a workflow.  The parameter must be
 * connected to one or more parameters defined in the workflow that will
 * provide the value of the output parameter.
 *
 */

export interface WorkflowOutputParameter extends OutputParameter {


    /**
     * Specifies one or more workflow parameters that supply the value of to
     * the output parameter.
     *
     */
    outputSource?: string | string[];


    /**
     * The method to use to merge multiple sources into a single array.
     * If not specified, the default method is "merge_nested".
     *
     */
    linkMerge?: LinkMergeMethod;


    /**
     * Specify valid types of data that may be assigned to this parameter.
     *
     */
        type?: CWLType | OutputRecordSchema | OutputEnumSchema | OutputArraySchema | string | Array<CWLType | OutputRecordSchema | OutputEnumSchema | OutputArraySchema | string>;

}