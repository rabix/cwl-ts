import {EnvironmentDef} from "../environment-def";
import {Requirement} from "./requirement";
export interface EnvVarRequirement extends Requirement {

    class: "EnvVarRequirement";

    envDef: EnvironmentDef[];
}