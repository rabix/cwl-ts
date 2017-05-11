import {UnimplementedMethodException} from "../UnimplementedMethodException";
import {cleanupNull, nullifyObjValues} from "../utils";
import {Issue} from "./Issue";
import {Validatable} from "./Validatable";
import {Validation} from "./Validation";

export abstract class ValidationBase implements Validatable {

    private _validation: Validation = {warnings: [], errors: []};

    public issues: { [key: string]: Issue } = {};

    get validation(): Validation {
        return {
            warnings: this.filterIssues("warning"),
            errors: this.filterIssues("error")
        };
    }

    /** @deprecated */
    set validation(value: Validation) {
        console.warn(`Setting validation is deprecated. Please use updateValidity(issue: {[key: string]: Issue}) instead`);
        // if (value !== this._validation) {
            // this._validation = Object.assign({errors: [], warnings: []}, value);
            // this.updateParentValidation(this._validation);
        // }

        // actually got issues, not Validation
        // if (!value.errors) {

        // }
    }

    public updateValidity(issue: {[key: string]: Issue}) {

        this.issues = cleanupNull({...this.issues, ...issue});

        // console.log("on validate to this thingy", issue);
        // if (!issue) {
        //     this.issues[loc] = null;
        // } else {
        //     Array.isArray(this.issues[loc]) ?
        //         this.issues[loc].push(issue) :
        //         this.issues[loc] = [issue];
        // }

        this.hasErrors = !!this.filterIssues("error").length;
        this.hasWarnings = !!this.filterIssues("warning").length;

        this.updateParentValidation(this.issues);
    }

    protected cleanValidity() {
        this.issues = nullifyObjValues(this.issues);
        this.updateParentValidation(this.issues);
        this.issues = {};

        this.hasErrors = false;
        this.hasWarnings = false;
    }

    public loc = "";

    constructor(loc: string) {
        this.loc = loc || "";
    }

    public setValidationCallback(fn: (err: Validation | any) => void): void {
        this.updateParentValidation = fn;
    }

    protected updateParentValidation = (err: Validation | any) => {
    };

    public filterIssues(type: "warning" | "error" | "info" = "error") {
        return Object.keys(this.issues)
            .filter(key => this.issues[key].type === type)
            .map(key => ({...this.issues[key], ...{loc: key}}));
    }

    public validate(): Promise<any> {
        new UnimplementedMethodException("validate");
        return new Promise(res => {
            res(this.issues);
        });
    }

    hasErrors = false;

    hasWarnings = false;
}
