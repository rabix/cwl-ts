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
     * Validates object, saves validity to internal state and returns results
     */
    validate(): Validation;
    /**
     * If object can have children and its validation is composed of child validations,
     * children will call this method to propagate their new states
     */
    setValidationCallback(loc: "string", fn: (err: Validation) => void): void;
}


export abstract class ValidationBase implements Validatable {
    public validation: Validation = {errors: [], warnings: []};

    public loc = "";

    constructor(loc: string) {
        this.loc = loc;
    }

    public validate: () => Validation;

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
