import {InputParameter} from "./InputParameter";

export interface SBGWorkflowInputParameter extends InputParameter{
    'sbg:x'?: number;
    'sbg:y'?: number;
}