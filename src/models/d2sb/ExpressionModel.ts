import {Expression} from "../../mappings/d2sb/Expression";
import {Serializable} from "../interfaces/Serializable";
import {Validatable, Validation, ValidationError} from "../interfaces/Validatable";

export class ExpressionModel implements Serializable<string | Expression>, Validatable {
    public result: any;

    get validation(): Validation {
        return this._validation;
    }

    set validation(value: Validation) {
        this._validation = Object.assign({error: [], warning: []}, value);
    }

    private _parent: Validatable;

    public set parent(value: Validatable) {
        if (value.validate && value.updateValidity) {
            this._parent = value;
        } else {
            throw new TypeError(`Parent of ExpressionModel must implement Validatable interface`);
        }
    }

    public get parent(): Validatable {
        return this._parent;
    }

    updateValidity(): void {
    }

    validate(): Validation {
        return this._validation;
    }

    /**
     * Sets validation object on expression
     * //@todo(maya) this should be replace with a validate function which calls internal executor
     *
     * @param err
     * @param type
     */
    public setError(err: ValidationError[], type: "error" | "warning") {
        this._validation       = {};
        this._validation[type] = err;
        this.parent.updateValidity(this._validation);
    }

    private _validation: Validation = {warning: [], error: []};

    /** Internal CWL representation of Expression */
    private value: string | Expression;

    /** Internal type */
    private _type: "string" | "expression"; //@todo add other types (int, long, etc)

    /** Flag if model contains expression */
    public get isExpression() {
        return this.type === "expression";
    };

    /** Setter for model type. Model holds either expression or primitive like "string" */
    public set type(type: "string" | "expression") {
        if (type !== "string" && type !== "expression") {
            throw new TypeError(`Unknown ExpressionModel type. "${type}" does not exist or is not supported yet.`);
        }
        this._type = type;
    }

    /** Getter for model type. Returns internal representation */
    public get type() {
        return this._type;
    }

    constructor(value: string | Expression = "") {
        this.deserialize(value);
        this.type = (value as Expression).script ? "expression" : "string"
    }

    /**
     * Returns CWL representation.
     * @returns {string|Expression}
     */
    public serialize(): string | Expression {
        return this.value;
    }


    /**
     * Sets CWL representation as internal value
     */
    public deserialize(val: string | Expression) {
        this.value = val;
    }

    /**
     * Sets value of expression.script or primitive based on type parameter.
     * @param val
     * @param type
     */
    public setValue(val: string, type: "expression" | "string") {
        if (type === "expression") {
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
        return this.type === "expression" ?
            (<Expression> this.value).script :
            <string> this.value;
    }

    /**
     * Returns script value of expression.script, or undefined if not set.
     * @returns {string}
     */
    public getScript(): string {
        return (this.value as Expression).script;
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

    /**
     * @deprecated
     * @param expressionScript
     */
    public setValueToExpression(expressionScript: string) {
        this.value = {
            class: "Expression",
            engine: "#cwl-js-engine",
            script: expressionScript
        };
        this.type  = "expression";
    }

    /**
     * @deprecated
     * @param value
     */
    public setValueToString(value: string) {
        this.value = value;
        this.type  = "string";
    }

    /** @deprecated */
    public getExpressionScript(): string {
        return this.toString();
    }
}
