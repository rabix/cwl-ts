import {OutputParameter} from "./OutputParameter";
import {LinkMergeMethod} from "./LinkMergeMethod";

export interface WorkflowOutputParameter extends OutputParameter {
    source: string | string[];
    linkMerge: LinkMergeMethod;
    'sbg:x'?: number;
    'sbg:y'?: number;
}