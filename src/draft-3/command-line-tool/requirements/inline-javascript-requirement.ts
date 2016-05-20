import {Requirement} from "./requirement";
export interface InlineJavascriptRequirement extends Requirement {

    class: "InlineJavascriptRequirement";
    
    expressionLib?: string[];
}