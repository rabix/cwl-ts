import {UnimplementedMethodException} from "../UnimplementedMethodException";
import {nullifyObjValues} from "../utils";
import {Issue} from "./Issue";
import {Validatable} from "./Validatable";

export abstract class ValidationBase implements Validatable {

    public issues: { [key: string]: Issue } = {};
    public errors: Issue[] = [];
    public warnings: Issue[] = [];

    public updateValidity(issue: {[key: string]: Issue}, stopPropagation = false) {
        this.issues = {...this.issues, ...issue};

        this.errors = this.filterIssues("error");
        this.warnings = this.filterIssues("warning");
        this.hasErrors = !!this.errors.length;
        this.hasWarnings = !!this.warnings.length;

        // sometimes we want to contain warnings/info to the objects where they occur
        if (!stopPropagation) {
            this.updateParentValidation(this.issues);
        }
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

    /**
     * Updates location and propagates validity up the tree
     * @param newLoc
     */
    public updateLoc(newLoc: string) {
        const oldLoc = this.loc;
        this.issues[newLoc] = this.issues[oldLoc];
        delete this.issues[oldLoc];

        this.loc = newLoc;
        // @todo this doesn't change the location of all nested children!
        this.updateValidity(this.issues);
    }

    public setValidationCallback(fn: (err: { [key: string]: Issue }) => void): void {
        this.updateParentValidation = fn;
    }

    protected updateParentValidation = (err: { [key: string]: Issue }) => {
    };

    public filterIssues(type: "warning" | "error" | "info" = "error") {
        const res = [];
        for (let key in this.issues) {
            if (this.issues[key] && this.issues[key].type === type) {
                res.push({...this.issues[key], ...{loc: key}});
            }
        }
        return res;
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
