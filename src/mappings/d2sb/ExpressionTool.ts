import {Process} from "./Process";
import {Expression} from "./Expression";

export interface ExpressionTool extends Process {
    class: "ExpressionTool";
    expression: Expression;
}