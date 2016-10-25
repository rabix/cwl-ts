import {ExpressionClass, Expression} from "../../mappings/d2sb/Expression";

export class ExpressionModel {

    private class: ExpressionClass;
    private engine: string = "cwl-js-engine";

    public script: string;
    public expressionValue?: string;

    constructor(attrs: {
        script: string;
        expressionValue: string;
    }) {
        this.script = attrs.script;
        this.expressionValue = attrs.expressionValue;
    }

    public getCwlModel(): Expression {
        return {
            class: this.class,
            script: this.script,
            engine: this.engine
        }
    }
}
