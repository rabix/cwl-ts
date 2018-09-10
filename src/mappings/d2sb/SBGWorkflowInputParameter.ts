import {Datatype} from "./Datatype";
import {WorkflowInputSchema} from "./WorkflowInputSchema";
import {Expression} from "../../mappings/v1.0/Expression";

export interface SBGWorkflowInputParameter {
    type?: Datatype | WorkflowInputSchema | string | Array<Datatype | WorkflowInputSchema | string>
    id: string;
    label?: string;
    description?: string;
    secondaryFiles?: string | Expression | Array<string | Expression>;
    'sbg:includeInPorts'?: boolean;
    'sbg:fileTypes'?: string;
    'sbg:x'?: number;
    'sbg:y'?: number;
}