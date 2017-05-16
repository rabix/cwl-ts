import {UnimplementedMethodException} from "../UnimplementedMethodException";
import {cleanupNull, nullifyObjValues} from "../utils";
import {Issue} from "./Issue";
import {Validatable} from "./Validatable";
import {Validation} from "./Validation";

export abstract class ValidationBase implements Validatable {

    public issues: { [key: string]: Issue } = {};
    public errors: Issue[] = [];
    public warnings: Issue[] = [];

    /** @deprecated */
    get validation(): Validation {
        return {
            warnings: this.filterIssues("warning"),
            errors: this.filterIssues("error")
        };
    }

    /** @deprecated */
    set validation(value: Validation) {
        console.warn(`Setting validation is deprecated. Please use updateValidity(issue: {[key: string]: Issue}) instead`);
    }

    public updateValidity(issue: {[key: string]: Issue}) {

        this.issues = cleanupNull({...this.issues, ...issue});

        this.errors = this.filterIssues("error");
        this.warnings = this.filterIssues("warning");
        this.hasErrors = !!this.errors.length;
        this.hasWarnings = !!this.warnings.length;

        this.updateParentValidation(this.issues);
    }

    protected cleanValidity() {
        this.issues = nullifyObjValues(this.issues);
        this.updateParentValidation(this.issues);

        this.hasErrors = false;
        this.hasWarnings = false;
    }

    public loc = "";

    constructor(loc: string) {
        this.loc = loc || "";
        this.issues[this.loc] = null;
    }

    public setValidationCallback(fn: (err: { [key: string]: Issue }) => void): void {
        this.updateParentValidation = fn;
        this.updateParentValidation(this.issues);
    }

    protected updateParentValidation = (err: { [key: string]: Issue }) => {
    };

    public filterIssues(type: "warning" | "error" | "info" = "error") {
        return Object.keys(this.issues)
            .filter(key => this.issues[key] && this.issues[key].type === type)
            .map(key => ({...this.issues[key], ...{loc: key}}));
    }

    public validate(...args: any[]): Promise<any> {
        new UnimplementedMethodException("validate");
        return new Promise(res => {
            res(this.issues);
        });
    }

    hasErrors = false;

    hasWarnings = false;
}
