import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {Expression as SBDraft2Expression} from "../../mappings/d2sb/Expression";
import {Expression as V1Expression} from "../../mappings/v1.0/Expression";

export abstract class ExpressionModel extends ValidationBase implements Serializable<any> {
    public customProps = {};

    protected cachedContext: any = {};

    public result: any;

    /** Internal type */
    protected _type: "string" | "expression" | "number" = "string";

    /** Setter for model type. Model holds either expression or primitive like "string" */
    public set type(type: "string" | "expression" | "number") {
        if (type !== "string" && type !== "expression" && type !== "number") {
            throw new TypeError(`Unknown ExpressionModel type. "${type}" does not exist or is not supported yet.`);
        }
        this._type = type;
    }

    /** Flag if model contains expression */
    public get isExpression() {
        return this.type === "expression";
    };

    /** Getter for model type. Returns internal representation */
    public get type() {
        return this._type;
    }

    /**
     * Returns CWL representation.
     */
    public serialize(): any {
        new UnimplementedMethodException("serialize", "ExpressionModel");
        return null;
    }


    /**
     * Sets CWL representation as internal value
     */
    public deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize", "ExpressionModel");
    }

    /**
     * Evaluates expression and sets its result to result property.
     *
     * If expression throws a SyntaxError, no result is returned and the syntax error is pushed to
     * validation.errors. If expression throws any other exception, it is pushed to validation.warnings
     *
     * @param context
     * @returns {any}
     */
    public evaluate(context: any): Promise<any> {
        new UnimplementedMethodException("evaluate", "ExpressionModel");
        return null;
    }

    /**
     * Returns script value of expression.script, or undefined if not set.
     * @returns {string}
     */
    public getScript(): string {
        new UnimplementedMethodException("getScript", "ExpressionModel");
        return null;
    }

    /**
     * Sets value of expression.script or primitive based on type parameter.
     */
    public setValue(val: number | string | SBDraft2Expression | V1Expression, type:
                        "expression"
                        | "string"
                        | "number") {
        new UnimplementedMethodException("setValue", "ExpressionModel");
    }

    /**
     * Returns string representation of expression.script or primitive value.
     * @returns {string}
     */
    public toString(): string {
        new UnimplementedMethodException("toString", "ExpressionModel");
        return null;
    }

    /**
     * Wraps expression.script (if set) for execution. If not set, returns undefined.
     *
     * @returns {string|undefined}
     */
    public getScriptForExec(): string {
        new UnimplementedMethodException("getScriptForExec", "ExpressionModel");
        return null;
    }
}