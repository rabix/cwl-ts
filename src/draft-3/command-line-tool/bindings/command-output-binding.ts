import {Expression} from "../exxpression";
export interface CommandOutputBinding {
    glob?: string | Expression | string[];

    loadContents?: boolean;

    outputEval?: string | Expression;
}