import {Process} from "./Process";
import {WorkflowStep} from "./WorkflowStep";
import {SBGWorkflowInputParameter} from "./SBGWorkflowInputParameter";
import {WorkflowOutputParameter} from "./WorkflowOutputParameter";

export type WorkflowClass = "Workflow";

export interface Workflow extends Process {
    inputs: SBGWorkflowInputParameter[];
    outputs: WorkflowOutputParameter[];
    class: WorkflowClass;
    steps: WorkflowStep[];

    'sbg:image_url'?: string;
    'sbg:canvas_y'?: number;
    'sbg:canvas_x'?: number;
    'sbg:canvas_zoom'?: number;
}