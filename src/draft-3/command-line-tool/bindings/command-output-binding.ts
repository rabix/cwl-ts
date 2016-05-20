import {Expression} from "../expression";
export interface CommandOutputBinding {
    glob?: string | Expression | string[];

    loadContents?: boolean;

    outputEval?: string | Expression;
}