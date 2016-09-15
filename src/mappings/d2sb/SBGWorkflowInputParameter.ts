import {Datatype} from "./Datatype";
import {WorkflowInputSchema} from "./WorkflowInputSchema";

export interface SBGWorkflowInputParameter {
    type?: Datatype | WorkflowInputSchema | string | Array<Datatype | WorkflowInputSchema | string>
    id: string;
    'sbg:includeInPorts'?: boolean;
    'sbg:x'?: number;
    'sbg:y'?: number;
}