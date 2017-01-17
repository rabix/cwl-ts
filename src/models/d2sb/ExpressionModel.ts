import {Expression} from "../../mappings/d2sb/Expression";
import {Serializable} from "../interfaces/Serializable";
import {ExpressionEvaluator} from "../helpers/ExpressionEvaluator";
import {ValidationBase, Validation} from "../helpers/validation";

export class ExpressionModel extends ValidationBase implements Serializable<number | string | Expression> {
    customProps: any = {};

    validate(): Validation {
        return this.validation;
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
    public evaluate(context: { $job?: any, $self?: any } = {}): Promise<any> {
        if (this.value !== undefined) {
            this.validation = {errors: [], warnings: []};


            return new Promise((res, rej) => {
                ExpressionEvaluator.evaluateD2(this.value, context.$job, context.$self).then(suc => {
                    this.result = suc;
                    res(suc !== undefined ? suc : "");

                }, ex => {
                    const err = {loc: this.loc, message: ex.toString()};

                    if (ex.name === "SyntaxError") {
                        this.validation = {
                            errors: [err],
                            warnings: []
                        };

                        rej(Object.assign({type: "error"}, err));
                    } else {
                        this.validation = {
                            warnings: [err],
                            errors: []
                        };

                        rej(Object.assign({type: "warning"}, err));
                    }
                })
            });
            // return ExpressionEvaluator.evaluateD2(this.value, context.$job, context.$self).then(suc => {
            //     this.result = suc;
            //     return suc !== undefined ? suc : "";
            // }, ex => {
            //     const err = {loc: this.loc, message: ex.toString()};
            //
            //     if (ex.name === "SyntaxError") {
            //         this.validation = {
            //             errors: [err],
            //             warnings: []
            //         };
            //
            //         return new Promise((res, rej) => {
            //             rej(Object.assign({type: "error"}, err));
            //         });
            //     } else {
            //         this.validation = {
            //             warnings: [err],
            //             errors: []
            //         };
            //
            //         return new Promise((res, rej) => {
            //             rej(Object.assign({type: "warning"}, err));
            //         });
            //     }
            // });
        }

        return undefined;
    }

    /** Cached result of expression last time it was evaluated */
    public result: any;

    /** Internal CWL representation of Expression */
    private value: number | string | Expression;

    //@todo add other primitive types (int, long, etc)
    /** Internal type */
    private _type: "string" | "expression" | "number" = "string";

    /** Flag if model contains expression */
    public get isExpression() {
        return this.type === "expression";
    };

    /** Setter for model type. Model holds either expression or primitive like "string" */
    public set type(type: "string" | "expression" | "number") {
        if (type !== "string" && type !== "expression" && type !== "number") {
            throw new TypeError(`Unknown ExpressionModel type. "${type}" does not exist or is not supported yet.`);
        }
        this._type = type;
    }

    /** Getter for model type. Returns internal representation */
    public get type() {
        return this._type;
    }

    constructor(loc?: string, value?: number | string | Expression) {
        super(loc);

        // guard against passing something that is already wrapped
        if (value instanceof ExpressionModel) {
            value = (<ExpressionModel> value).serialize();
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
        this.validation = {errors: [], warnings: []};

        if (type === "expression" && typeof val === "string") {
            this.value = {
                "class": "Expression",
                engine: "#cwl-js-engine",
                script: val
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

    /**
     * Wraps expression.script (if set) for execution. If not set, returns undefined.
     *
     * @returns {string|undefined}
     */
    public getScriptForExec(): string {
        if (this.type !== "expression") return undefined;

        const val = <Expression> this.value;
        if (val.script.charAt(0) === '{') {
            return "(function()" + val.script + ")()";
        }

        return val.script;
    }
}
