import {ProcessRequirement} from "./ProcessRequirement";

export interface DockerRequirement  extends ProcessRequirement {
    class: string;
    dockerPull?: string;
    dockerLoad?: string; //todo not used by sbg
    dockerFile?: string; //todo not used by sbg
    dockerImageId?: string;
    dockerOutputDirectory?: string; //todo not used by sbg
}