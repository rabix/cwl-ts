import {Expression} from "../../mappings/d2sb/Expression";

export class ExpressionModel {

    private value: string | Expression;

    constructor(value: string | Expression) {
        this.value = value;
    }

    public serialize(): Expression | string {
        return this.value;
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
        if ((<Expression>this.value).script !== undefined) {
            return (<Expression>this.value).script;
        } else if (typeof  this.value === "string") {
            return this.value;
        }
    }
}
