import {UnimplementedMethodException} from "../UnimplementedMethodException";
import {nullifyObjValues} from "../utils";
import {Issue} from "./Issue";
import {Validatable} from "./Validatable";

export abstract class ValidationBase implements Validatable {

    public issues: { [key: string]: Issue } = {};
    public errors: Issue[] = [];
    public warnings: Issue[] = [];

    public updateValidity(issue: {[key: string]: Issue}) {
        this.issues = {...this.issues, ...issue};

        this.errors = this.filterIssues("error");
        this.warnings = this.filterIssues("warning");
        this.hasErrors = !!this.errors.length;
        this.hasWarnings = !!this.warnings.length;

        this.updateParentValidation(this.issues);
    }

    public cleanValidity() {
        this.issues = nullifyObjValues(this.issues);
        this.updateParentValidation(this.issues);

        this.hasErrors = false;
        this.hasWarnings = false;
        this.errors = [];
        this.warnings = [];
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
