import {Expression} from "../../mappings/d2sb/Expression";
import {ExpressionModel} from "../generic/ExpressionModel";
import {Serializable} from "../interfaces/Serializable";

export class SBDraft2ExpressionModel extends ExpressionModel implements Serializable<number | string | Expression> {
    /**
     * Evaluates expression and sets its result to result property.
     *
     * If expression throws a SyntaxError, no result is returned and the syntax error is pushed to
     * validation.errors. If expression throws any other exception, it is pushed to validation.warnings
     *
     * @param context
     * @returns {any}
     */
    public evaluate(context: { $job?: any, $self?: any } = this.cachedContext): Promise<any> {
        if (this.value !== undefined) {
            return this._evaluate(this.value, context, "draft-2")
        }

        return new Promise((res) => {res(undefined)});
    }

    /** Cached result of expression last time it was evaluated */
    public result: any;

    /** Internal CWL representation of Expression */
    private value: number | string | Expression;

    constructor(value?: number | string | Expression, loc?: string) {
        super(loc);

        // guard against passing something that is already wrapped
        if (value instanceof SBDraft2ExpressionModel) {
            value = (<SBDraft2ExpressionModel> value).serialize();
        }

        this.deserialize(value);
        if (value) {
            this.type = (value as Expression).script ? "expression" : "string"
        }
    }

    /**
     * Returns CWL representation.
     */
    public serialize(): number | string | Expression {
        if (this.value && this.value.hasOwnProperty("script") && (<Expression> this.value).script === "") {
            return undefined;
        } else if (this.value === "" || this.value === null) {
            return undefined;
        }
        return this.value;
    }


    /**
     * Sets CWL representation as internal value
     */
    public deserialize(val: number | string | Expression = "") {
        this.value = val;
    }

    /**
     * Sets value of expression.script or primitive based on type parameter.
     */
    public setValue(val: number | string | Expression, type: "expression" | "string" | "number") {
        this.result     = undefined;
        this.cleanValidity();

        if (type === "expression" && typeof val === "string") {
            this.value = {
                "class": "Expression",
                engine: "#cwl-js-engine",
                script: val.trim() === "" ? "" : val
            };
        } else {
            this.value = val;
        }

        this.type = type;
    }

    /**
     * Returns string representation of expression.script or primitive value.
     * @returns {string}
     */
    public toString(): string {

        if (this.type === "expression") {
            return (<Expression> this.value).script
        } else if (this.value === null || this.value === undefined) {
            return <string> this.value;
        } else {
            return this.value.toString();
        }
    }

    /**
     * Returns script value of expression.script, or undefined if not set.
     * @returns {string}
     */
    public getScript(): string {
        return this.value !== undefined && this.value !== null ?
            (this.value as Expression).script :
            undefined;
    }

    clone(): SBDraft2ExpressionModel {
        return new SBDraft2ExpressionModel(this.serialize(), this.loc);
    }

    cloneStatus(clone: SBDraft2ExpressionModel) {
        this.setValue(clone.serialize(), clone.type);
        this.updateValidity({...clone.issues});
    }
}
