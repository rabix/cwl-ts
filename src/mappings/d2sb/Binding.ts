import {Expression} from "./Expression";

export interface Binding {
    loadContents?: boolean;
    secondaryFiles?: string | Expression | Array<string | Expression>;
}