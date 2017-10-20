import {UnimplementedMethodException} from "../UnimplementedMethodException";
import {concatIssues} from "../utils";
import {Issue, IssueEvent} from "./Issue";
import {ErrorCode} from "./ErrorCode";

export abstract class ValidationBase {
    protected issues: { [key: string]: Issue[] } = {};
    private _errors: Issue[]                     = [];
    private _warnings: Issue[]                   = [];
    private hasNewErrors                         = false;
    private hasNewWarnings                       = false;

    get warnings(): Issue[] {
        if (this.hasNewWarnings) {
            this._warnings      = this.filterIssues("warning");
            this.hasNewWarnings = false;
        }

        return this._warnings;
    }

    get errors(): Issue[] {
        if (this.hasNewErrors) {
            this._errors      = this.filterIssues("error");
            this.hasNewErrors = false;
        }

        return this._errors;
    }

    protected updateValidity(event: IssueEvent) {
        // sets these issues with the event received
        this.issues = concatIssues(this.issues, event.data, event.overwrite);

        this.hasNewErrors   = true;
        this.hasNewWarnings = true;

        // sometimes we want to contain warnings/info to the objects where they occur
        if (!event.stopPropagation) {
            this.updateParentValidation(event);
        }
    }

    public setIssue(data: { [key: string]: Issue[] | Issue }, stopPropagation = false) {
        this.updateValidity({data, overwrite: false, stopPropagation: stopPropagation})
    }

    public clearIssue(code: ErrorCode) {
        let hadIssue  = false;
        const isGroup = code % 100 === 0;
        const group   = code / 100;

        for (let key in this.issues) {
            if (this.issues[key].length) {
                if (code === ErrorCode.ALL) {
                    hadIssue = true;
                    this.issues[key] = []
                } else {
                    const initLen    = this.issues[key].length;
                    this.issues[key] = this.issues[key].filter(i => {
                        if (isGroup) {
                            return Math.floor(i.code / 100) !== group;
                        }
                        return i.code !== code
                    });
                    hadIssue = initLen !== this.issues[key].length || hadIssue;
                }
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
    }

    public loc = "";

    constructor(loc: string) {
        this.loc              = loc || "";
        this.issues[this.loc] = [];
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
            if (this.issues[key].length) {
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
}
