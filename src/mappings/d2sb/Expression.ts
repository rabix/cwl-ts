export type ExpressionClass = "Expression";

export interface Expression {
    engine: string;
    script: string;
    class: ExpressionClass;
}