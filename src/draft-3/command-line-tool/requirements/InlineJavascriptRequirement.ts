import {BaseRequirement} from "./BaseRequirement";
export interface InlineJavascriptRequirement extends BaseRequirement {
    expressionLib?: string[];
}