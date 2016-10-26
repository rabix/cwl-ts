import {ValidationError} from "../interfaces/ValidationError";
export interface Validatable {
    validate(): ValidationError[];
}