
import {Validatable} from "./Validatable";
import {Validation} from "./Validation";
import {ValidationUpdater} from "./ValidationUpdate";

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
        this.loc = loc || "";
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

    public validate() {}

    public hasErrors() {
        return this._validation.errors.length !== 0;
    }

    public hasWarnings() {
        return this._validation.warnings.length !== 0;
    }
}
