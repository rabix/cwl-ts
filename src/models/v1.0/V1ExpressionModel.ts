import {ExpressionModel} from "../generic/ExpressionModel";
import {ExpressionEvaluator, ExprObj} from "../helpers/ExpressionEvaluator";
import {Expression} from "../../mappings/v1.0/Expression";

export class V1ExpressionModel extends ExpressionModel {
    private value?: string     = "";
    private tokens?: ExprObj[] = [];

    public serialize(): string | Expression {
        return this.value !== "" ? this.value : undefined;
    }

    public deserialize(attr: string): void {
        this.value = attr;
        this.tokenizeAndSetType(attr);
    }

    constructor(expression?: string | V1ExpressionModel, loc?: string) {
        super(loc);

        if (expression instanceof V1ExpressionModel) {
            expression = (<V1ExpressionModel> expression).serialize();
        }

        if (expression) this.deserialize(expression);
    }

    private tokenizeAndSetType(str: string): ExprObj[] {
        // parse expression
        this.tokens = ExpressionEvaluator.grabExpressions(str || "") || [];

        // if expression is literal, type is string, otherwise it's complex (expression or function)
        this.type = this.tokens.length === 1 && this.tokens[0].type === "literal" ? "string" : "expression"
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
        this.result     = undefined;
        this.validation = {errors: [], warnings: []};

        this.tokenizeAndSetType(val);
        this.value = val;
    }

    public getScript(): string {
        return this.value;
    }

    public toString(): string {
        return this.value;
    }
}