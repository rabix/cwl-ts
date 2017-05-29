import {Issue} from "./Issue";

export interface Validatable {
    /**
     * If object can have children and its validation is composed of child validations,
     * children will call this method to propagate their new states
     */
    setValidationCallback(fn: (err: { [key: string]: Issue }) => void): void;
}