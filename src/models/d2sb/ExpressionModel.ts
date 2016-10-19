import {Expression} from "../../mappings/d2sb/Expression";

export class ExpressionModel {

    private value: string | Expression;
    private evaluatedValue: string;

    constructor(attrs: {
        value?: string | Expression;
        evaluatedValue?: string;
    }) {
        this.value = attrs.value;
        this.evaluatedValue = attrs.evaluatedValue;
    }

    public serialize(): Expression | string {
        return this.value;
    }

    public setEvaluatedValue(value: string): void {
        this.evaluatedValue = value;
    }

    public getEvaluatedValue(): string {
        return this.evaluatedValue;
    }

    public setValueToExpression(expressionScript: string) {
        this.value = {
            class: "Expression",
            engine: "cwl-js-engine",
            script: expressionScript
        };
    }

    public setValueToString(value: string) {
        this.value = value;
    }

    public getExpressionScript(): string {
        if ((<Expression>this.value).script) {
            return (<Expression>this.value).script;
        } else if (typeof  this.value === "string") {
            return this.value;
        }
    }
}
