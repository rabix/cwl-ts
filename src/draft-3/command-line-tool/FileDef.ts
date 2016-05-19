import {Expression} from "./Expression";
export interface FileDef {
    filename: string | Expression;

    fileContent: string | Expression;
}