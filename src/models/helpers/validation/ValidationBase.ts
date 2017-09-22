import {UnimplementedMethodException} from "../UnimplementedMethodException";
import {concatIssues, nullifyObjValues} from "../utils";
import {Issue, IssueEvent} from "./Issue";
import {Validatable} from "./Validatable";
import {ErrorCode} from "./ErrorCode";

export abstract class ValidationBase implements Validatable {
    protected issues: { [key: string]: Issue[] } = {};
    private _errors: Issue[]                     = [];
    private _warnings: Issue[]                   = [];
    private hasUpdated                           = false;

    get warnings(): Issue[] {
        if (this.hasUpdated) {
            this._warnings = this.filterIssues("warning");
        }

        return this._warnings;
    }

    get errors(): Issue[] {
        if (this.hasUpdated) {
            this._errors = this.filterIssues("error");
        }

        return this._errors;
    }

    protected updateValidity(event: IssueEvent) {
        // sets these issues with the event received
        this.issues = concatIssues(this.issues, event.data, event.overwrite);

        this.hasUpdated = true;

        // sometimes we want to contain warnings/info to the objects where they occur
        if (event.propagate !== false) {
            this.updateParentValidation(event);
        }
    }

    public setIssue(data: { [key: string]: Issue[] | Issue }, stopPropagation?: boolean) {
        this.updateValidity({data, overwrite: false, propagate: stopPropagation})
    }

    public clearIssue(code: ErrorCode) {
        let hadIssue = false;

        for (let key in this.issues) {
            if (this.issues[key] !== null) {
                const initLen    = this.issues[key].length;
                this.issues[key] = this.issues[key].filter(i => i.code !== code);
                hadIssue         = initLen !== this.issues[key].length || hadIssue;
                this.issues[key] = this.issues[key].length ? this.issues[key] : null;
            }
        }

        if (hadIssue) {
            this.updateValidity({
                data: this.issues,
                overwrite: true
            });
        }
    }

    /**
     * @deprecated
     */
    public cleanValidity() {
        this.issues = nullifyObjValues(this.issues);
        this.updateParentValidation({
            overwrite: true,
            data: this.issues
        });

        this.hasErrors   = false;
        this.hasWarnings = false;
        this._errors     = [];
        this._warnings   = [];
    }

    public loc = "";

    constructor(loc: string) {
        this.loc              = loc || "";
        this.issues[this.loc] = null;
    }

    /**
     * Updates location and propagates validity up the tree
     * @param newLoc
     */
    public updateLoc(newLoc: string) {
        const oldLoc        = this.loc;
        this.issues[newLoc] = this.issues[oldLoc];
        delete this.issues[oldLoc];

        this.loc = newLoc;
        // @todo this doesn't change the location of all nested children!
        this.updateValidity({
            data: this.issues,
            overwrite: true
        });
    }

    public setValidationCallback(fn: (event: IssueEvent) => void): void {
        this.updateParentValidation = fn;
    }

    protected updateParentValidation = (event: IssueEvent) => {
    };

    /**
     * @param {"warning" | "error" | "info"} type
     * @returns {Array}
     */
    public filterIssues(type: "warning" | "error" | "info" = "error") {
        let res = [];
        for (let key in this.issues) {
            if (this.issues[key] !== null) {
                const filter = this.issues[key].filter(i => i.type === type);
                const map    = filter.map(i => ({...i, ...{loc: key}}));

                res = res.concat(map);
            }
        }
        return res;
    }

    /**
     * @deprecated
     * @param args
     * @returns {Promise<any>}
     */
    public validate(...args: any[]): Promise<any> {
        new UnimplementedMethodException("validate");
        return new Promise(res => {
            res(this.issues);
        });
    }

    hasErrors = false;

    hasWarnings = false;
}
