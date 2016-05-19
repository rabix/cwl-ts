import {Expression} from "../Expression";
export interface CommandOutputBinding {
    glob?: string | Expression | string[];

    loadContents?: boolean;

    outputEval?: string | Expression;
}