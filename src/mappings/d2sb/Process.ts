import {InputParameter} from "./InputParameter";
import {OutputParameter} from "./OutputParameter";
import {DockerRequirement} from "./DockerRequirement";
import {SubworkflowFeatureRequirement} from "./SubworkflowFeatureRequirement";
import {CreateFileRequirement} from "./CreateFileRequirement";
import {EnvVarRequirement} from "./EnvVarRequirement";
import {ScatterFeatureRequirement} from "./ScatterFeatureRequirement";
import {SchemaDefRequirement} from "./SchemaDefRequirement";
import {ExpressionEngineRequirement} from "./ExpressionEngineRequirement";


export interface Process {
    id?: string;
    inputs: InputParameter[];
    outputs: OutputParameter[];
    requirements?: Array<DockerRequirement |
        SubworkflowFeatureRequirement | //todo exists in SBG?
        CreateFileRequirement |
        EnvVarRequirement | //todo exists in SBG?
        ScatterFeatureRequirement | //todo exists in SBG?
        SchemaDefRequirement | //todo exists in SBG?
        ExpressionEngineRequirement>;
    hints?: Array<any>;
    label?: string;
    description?: string;
}