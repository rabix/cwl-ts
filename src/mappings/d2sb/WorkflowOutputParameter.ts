import {OutputParameter} from "./OutputParameter";
import {LinkMergeMethod} from "./LinkMergeMethod";
import {Expression} from "../v1.0/Expression";

export interface WorkflowOutputParameter extends OutputParameter {
    source?: string | string[];
    linkMerge?: LinkMergeMethod;
    secondaryFiles?: string | Expression | Array<string | Expression>;
    'sbg:x'?: number;
    'sbg:y'?: number;
}