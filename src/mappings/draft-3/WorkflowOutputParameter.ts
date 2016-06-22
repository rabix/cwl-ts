import {OutputParameter} from "./OutputParameter";
import {Sink} from "./Sink";


/**
 * Describe an output parameter of a workflow.  The parameter must be
 * connected to one or more parameters defined in the workflow that will
 * provide the value of the output parameter.
 *
 */

export interface WorkflowOutputParameter extends OutputParameter, Sink {

}