import {ErrorCode} from "./ErrorCode";

export interface Issue {
    type: "warning" | "error" | "info"
    message?: string
    code?: ErrorCode;
    loc?: string
}

export interface IssueEvent {
    data: { [key: string]: Issue[] | Issue };
    overwrite: boolean; // default is false
    propagate?: boolean; // default is true
}
