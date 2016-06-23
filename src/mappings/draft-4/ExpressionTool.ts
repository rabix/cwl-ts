import {Process} from "./Process";
import {Expression} from "./Expression";
import {ExpressionToolOutputParameter} from "./ExpressionToolOutputParameter";


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


    /**
     * Defines the parameters representing the output of the process.  May be
     * used to generate and/or validate the output object.
     *
     */
    outputs: Array<ExpressionToolOutputParameter>;

}