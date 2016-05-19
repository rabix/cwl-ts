import {BaseRequirement} from "./BaseRequirement";
export interface DockerRequirement extends BaseRequirement {
    dockerPull?: string;

    dockerLoad?: string;

    dockerFile?: string;

    dockerImport?: string;

    dockerImageId?: string;

    dockerOutputDirectory?: string;
}