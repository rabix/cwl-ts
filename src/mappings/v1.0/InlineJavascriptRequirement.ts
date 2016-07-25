import {ProcessRequirement} from "./ProcessRequirement";


/**
 * Indicates that the workflow platform must support inline Javascript expressions.
 * If this requirement is not present, the workflow platform must not perform expression
 * interpolatation.
 *
 */

export interface InlineJavascriptRequirement extends ProcessRequirement {


    /**
     * Always 'InlineJavascriptRequirement'
     */
        class: string;


    /**
     * Additional code fragments that will also be inserted
     * before executing the expression code.  Allows for function definitions that may
     * be called from CWL expressions.
     *
     */
    expressionLib?: string[];

}