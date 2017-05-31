import {ExpressionModel} from "../generic/ExpressionModel";
import {ExpressionEvaluator, ExprObj} from "../helpers/ExpressionEvaluator";
import {Expression} from "../../mappings/v1.0/Expression";
import {EventHub} from "../helpers/EventHub";

export class V1ExpressionModel extends ExpressionModel {
    private value?: string     = "";
    private tokens?: ExprObj[] = [];

    public serialize(): string | Expression {
        if (this.type === "expression" && this.eventHub) {
            this.eventHub.emit("expression.serialize", true);
        }
        return this.value !== "" ? this.value : undefined;
    }

    public deserialize(attr: string): void {
        this.value = attr;
        this.tokenizeAndSetType(attr);
    }

    constructor(expression?: string | V1ExpressionModel, loc?: string, eventHub?: EventHub) {
        super(loc, eventHub);

        if (expression instanceof V1ExpressionModel) {
            expression = (<V1ExpressionModel> expression).serialize();
        }

        if (expression) this.deserialize(expression);
    }

    private tokenizeAndSetType(str: string): ExprObj[] {
        // parse expression
        this.tokens = ExpressionEvaluator.grabExpressions(str || "") || [];

        // if expression is literal, type is string, otherwise it's complex (expression or function)
        this.type = this.tokens.length === 1 && this.tokens[0].type === "literal" || this.tokens.length === 0 ? "string" : "expression";
        return this.tokens;
    }

    public evaluate(context: { inputs?: any, self?: any, runtime?: any } = this.cachedContext) {
        if (this.value !== undefined) {
            return this._evaluate(this.value, context, "v1.0");
        }

        return new Promise((res) => {
            res(undefined)
        });
    }

    public setValue(val: string | Expression, type?: "expression" | "string") {
        this.result = undefined;

        this.tokenizeAndSetType(val);
        this.value = val;
    }

    public getScript(): string {
        return this.value;
    }

    public toString(): string {
        return this.value || "";
    }

    clone(): V1ExpressionModel {
        return new V1ExpressionModel(this.serialize(), this.loc);
    }

    cloneStatus(clone: V1ExpressionModel) {
        this.setValue(clone.serialize());
        this.updateValidity({...clone.issues});
    }
}