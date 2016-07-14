import {WorkflowStepInput} from "./WorkflowStepInput";
import {WorkflowStepOutput} from "./WorkflowStepOutput";
import {ExpressionEngineRequirement} from "./ExpressionEngineRequirement";
import {SchemaDefRequirement} from "./SchemaDefRequirement";
import {ScatterFeatureRequirement} from "./ScatterFeatureRequirement";
import {EnvVarRequirement} from "./EnvVarRequirement";
import {CreateFileRequirement} from "./CreateFileRequirement";
import {SubworkflowFeatureRequirement} from "./SubworkflowFeatureRequirement";
import {DockerRequirement} from "./DockerRequirement";
import {Workflow} from "./Workflow";
import {CommandLineTool} from "./CommandLineTool";
import {ExpressionTool} from "./ExpressionTool";
import {ScatterMethod} from "./ScatterMethod";

export interface WorkflowStep {
    id?: string;
    inputs: WorkflowStepInput[];
    outputs: WorkflowStepOutput[];

    requirements?: Array<DockerRequirement |
        SubworkflowFeatureRequirement | //todo exists in SBG?
        CreateFileRequirement |
        EnvVarRequirement | //todo exists in SBG?
        ScatterFeatureRequirement | //todo exists in SBG?
        SchemaDefRequirement | //todo exists in SBG?
        ExpressionEngineRequirement>;

    hints?: any[];
    label?: string;
    description?: string;

    run: CommandLineTool | ExpressionTool | Workflow;
    scatter?: string | string[];
    scatterMethod?: ScatterMethod

}