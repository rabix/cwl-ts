import {ExpressionModel} from "../generic/ExpressionModel";

export class V1ExpressionModel extends ExpressionModel {
    constructor(expression?: string, loc?: string) {
        super(loc);
    }
}