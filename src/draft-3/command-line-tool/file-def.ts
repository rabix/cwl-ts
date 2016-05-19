import {Expression} from "./expression";
export interface FileDef {
    filename: string | Expression;

    fileContent: string | Expression;
}