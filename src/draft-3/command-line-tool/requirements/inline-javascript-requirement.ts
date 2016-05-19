import {Requirement} from "./requirement";
export interface InlineJavascriptRequirement extends Requirement {
    expressionLib?: string[];
}