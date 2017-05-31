import {InputParameter} from "./InputParameter";
import {OutputParameter} from "./OutputParameter";
import {DockerRequirement} from "./DockerRequirement";
import {SubworkflowFeatureRequirement} from "./SubworkflowFeatureRequirement";
import {CreateFileRequirement} from "./CreateFileRequirement";
import {EnvVarRequirement} from "./EnvVarRequirement";
import {ScatterFeatureRequirement} from "./ScatterFeatureRequirement";
import {SchemaDefRequirement} from "./SchemaDefRequirement";
import {ExpressionEngineRequirement} from "./ExpressionEngineRequirement";
import {SBGRevision} from "./SBGRevision";
import {Expression} from "./Expression";

export interface SBGLink {
    label: string;
    id: string;
}

export interface Process {
    id?: string;
    cwlVersion?: string;
    "class": "Workflow" | "CommandLineTool" | "ExpressionTool" | string;
    inputs: InputParameter[];
    outputs: OutputParameter[];
    requirements?: Array<DockerRequirement |
        CreateFileRequirement |
        ExpressionEngineRequirement>;
    hints?: Array<any>;
    label?: string;
    description?: string;
    expression?: Expression;

    'sbg:modifiedBy'?: string;
    'sbg:revisionInfo'?: SBGRevision[],
    'sbg:revision'?: number;
    'sbg:createdBy'?: string;
    'sbg:id'?: string;
    'sbg:contributors'?: string[];
    'sbg:sbgMaintained'?: boolean;
    'sbg:project'?: string;
    'sbg:validationErrors'?: string[];
    'sbg:modifiedOn'?: number;
    'sbg:revisionNotes'?: string;
    'sbg:toolkit'?: string;
    'sbg:toolkitVersion'?: string;
    'sbg:links'?: SBGLink[];
    'sbg:toolAuthor'?: string;
    'sbg:license'?: string;
    'sbg:categories'?: string[];
}