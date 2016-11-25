import {ProcessRequirement} from "./ProcessRequirement";
export type DockerRequirementClass = "DockerRequirement";

export interface DockerRequirement  extends ProcessRequirement {
    class: DockerRequirementClass;
    dockerPull?: string;
    dockerLoad?: string; //todo not used by sbg
    dockerFile?: string; //todo not used by sbg
    dockerImageId?: string;
    dockerOutputDirectory?: string; //todo not used by sbg
}