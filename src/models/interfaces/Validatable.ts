export interface Validation {
    warning?: ValidationError[],
    error?: ValidationError[]
}

export interface ValidationError {
    message: string;
    loc: string; // property where error occurred
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
    updateValidity(err: Validation): void;
}