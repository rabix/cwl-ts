import {Expression} from "./exxpression";
export interface FileDef {
    filename: string | Expression;

    fileContent: string | Expression;
}