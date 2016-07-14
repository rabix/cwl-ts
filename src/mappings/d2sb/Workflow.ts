import {Process} from "./Process";
import {WorkflowStep} from "./WorkflowStep";
import {SBGWorkflowInputParameter} from "./SBGWorkflowInputParameter";
import {SBGWorkflowOutputParameter} from "./SBGWorkflowOutputParameter";
import {WorkflowOutputParameter} from "./WorkflowOutputParameter";

type WorkflowClass = "Workflow";

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