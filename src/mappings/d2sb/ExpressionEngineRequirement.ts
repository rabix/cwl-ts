import {SchemaDefRequirement} from "./SchemaDefRequirement";
import {ScatterFeatureRequirement} from "./ScatterFeatureRequirement";
import {EnvVarRequirement} from "./EnvVarRequirement";
import {CreateFileRequirement} from "./CreateFileRequirement";
import {SubworkflowFeatureRequirement} from "./SubworkflowFeatureRequirement";
import {DockerRequirement} from "./DockerRequirement";
import {ProcessRequirement} from "./ProcessRequirement";

export type ExpressionEngineRequirementClass = "ExpressionEngineRequirement";

export interface ExpressionEngineRequirement  extends ProcessRequirement {
    class: ExpressionEngineRequirementClass;
    id: string;
    requirements?: Array<DockerRequirement | SubworkflowFeatureRequirement | CreateFileRequirement | EnvVarRequirement | ScatterFeatureRequirement | SchemaDefRequirement | ExpressionEngineRequirement>;
    engineCommand?: string | string[];
    engineConfig?: string[];
}