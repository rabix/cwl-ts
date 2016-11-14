import {ValidationUpdater} from "../helpers/ValidationUpdate";
export interface Validation {
    warnings: ValidationError[],
    errors: ValidationError[]
}

export interface ValidationError {
    message: string;
    loc: string; // property where errors occurred
}

export interface Validatable {
    validation: Validation;
    /**
     * If object can have children and its validation is composed of child validations,
     * children will call this method to propagate their new states
     */
    setValidationCallback(fn: (err: Validation) => void): void;
}


export abstract class ValidationBase implements Validatable {

    private _validation: Validation = {warnings: [], errors: []};

    get validation(): Validation {
        return this._validation;
    }

    set validation(value: Validation) {
        if (value !== this._validation) {
            this._validation = Object.assign({errors: [], warnings: []}, value);
            this.onValidate(this._validation);
        }
    }

    public loc = "";

    constructor(loc: string) {
        this.loc = loc;
    }

    public setValidationCallback(fn: (err: Validation)=>void): void {
        this.onValidate = fn;
    }

    protected onValidate = (err: Validation) => {
    };

    protected updateValidity(err: Validation): void {
        if (this.validation === err) return;
        this.validation = ValidationUpdater.interchangeErrors(this.validation, err);
    }
}
