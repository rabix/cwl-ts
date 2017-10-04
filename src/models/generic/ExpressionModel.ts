import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {Expression as SBDraft2Expression} from "../../mappings/d2sb/Expression";
import {Expression as V1Expression} from "../../mappings/v1.0/Expression";
import {ExpressionEvaluator} from "../helpers/ExpressionEvaluator";
import {EventHub} from "../helpers/EventHub";
import {ErrorCode} from "../helpers/validation/ErrorCode";

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

    constructor(loc?: string, protected eventHub?: EventHub) {
        super(loc);
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
    public setValue(val: number | string | SBDraft2Expression | V1Expression, type: "expression"
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

    public validate(context?: any): Promise<any> {
        return this.evaluate(context).then((suc) => {
            this.clearIssue(ErrorCode.EXPR_ALL);
        }, (err) => {
            this.clearIssue(ErrorCode.EXPR_ALL);

            this.setIssue({
                [this.loc]: {
                    type: err.type,
                    message: err.message,
                    code: err.code
                }
            });
        });
    }

    protected _evaluate(value: number | string | SBDraft2Expression, context: any, version: "v1.0" | "draft-2"): Promise<any> {

        return new Promise((res, rej) => {

            ExpressionEvaluator.evaluate(value, context, version).then(suc => {
                this.result = suc;
                res(suc);
            }, ex => {

                let message = ex.message;
                let code = ErrorCode.EXPR_SYNTAX;

                if (ex.message.startsWith("Uncaught DataCloneError")) {
                    message = "Error: Return value should have transferable data (fully JSON-serializable)";
                    code = ErrorCode.EXPR_NOT_JSON;
                }

                const err = {loc: this.loc, message: message, code};

                if (ex.message.startsWith("Uncaught SyntaxError") || ex.name === "SyntaxError") {
                    rej(Object.assign({type: "error"}, err));
                } else {
                    if (ex.message.startsWith("Uncaught ReferenceError") || ex.name === "ReferenceError") {
                        code = ErrorCode.EXPR_REFERENCE;
                    } else if (ex.message.startsWith("Uncaught TypeError") || ex.name === "TypeError") {
                        code = ErrorCode.EXPR_TYPE;
                    }

                    rej(Object.assign({type: "warning", code}, err));
                }
            });
        });

    }

    abstract clone(): ExpressionModel

    abstract cloneStatus(clone: ExpressionModel);
}