import {ValidationError} from "./ValidationError";

export interface Validation {
    warnings: ValidationError[],
    errors: ValidationError[]
}
