import {Validation} from "./Validation";

export interface Validatable {
    validation: Validation;
    /**
     * If object can have children and its validation is composed of child validations,
     * children will call this method to propagate their new states
     */
    setValidationCallback(fn: (err: Validation) => void): void;
}