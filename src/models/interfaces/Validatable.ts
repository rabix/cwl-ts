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
    setValidationCallback(loc: "string", fn:(err: Validation) => void): void;
}


export abstract class ValidationBase implements Validatable {
    public validation: Validation;

    public loc = "";

    public validate(): Validation {
        return this.validation;
    }

    public setValidationCallback(loc, fn: (err: Validation)=>void): void {
        this.loc = loc;
        this.onValidate = fn;
    }

    protected onValidate = (err: Validation) => {
        console.log("hello this is a thing");
    };
}
