import {V1ExpressionModel} from "../v1.0";

export function toExpression(array: Array<string>): V1ExpressionModel {
    return array.length === 1 ? new V1ExpressionModel(array[0]) : new V1ExpressionModel();
}

export function toArray(expression: V1ExpressionModel): Array<string> {
    const strExpression = expression.serialize();

    if (expression.isExpression) {
        return [];
    }

    return strExpression ? [strExpression] : [];
}
