import {Process} from "./Process";
import {Expression} from "./Expression";

type ExpressionToolClass = "ExpressionTool";

export interface ExpressionTool extends Process {
    class: ExpressionToolClass;
    expression: Expression;
}