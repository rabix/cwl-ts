import {Process} from "./Process";
import {Expression} from "./Expression";


/**
 * Execute an expression as a process step.
 *
 */

export interface ExpressionTool extends Process {


    class: string;


    /**
     * The expression to execute.  The expression must return a JSON object which
     * matches the output parameters of the ExpressionTool.
     *
     */
    expression: string | Expression;

}