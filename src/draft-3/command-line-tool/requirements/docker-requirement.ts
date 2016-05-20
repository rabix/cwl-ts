import {Requirement} from "./requirement";
export interface DockerRequirement extends Requirement {

    class: "DockerRequirement";

    dockerPull?: string;

    dockerLoad?: string;

    dockerFile?: string;

    dockerImport?: string;

    dockerImageId?: string;

    dockerOutputDirectory?: string;
}