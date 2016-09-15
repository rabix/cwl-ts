import {LinkMergeMethod} from "./LinkMergeMethod";

export interface WorkflowStepInput {
    id: string;
    source?: string | string[];
    linkMerge?: LinkMergeMethod;
    default?: any;
}