import {Process} from "./Process";
import {WorkflowOutputParameter} from "./WorkflowOutputParameter";
import {WorkflowStep} from "./WorkflowStep";

type WorkflowClass = "Workflow";

export interface Workflow extends Process {
    outputs: WorkflowOutputParameter[];
    class: WorkflowClass;
    steps: WorkflowStep[];
}