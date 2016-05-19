import {EnvironmentDef} from "../environment-def";
import {Requirement} from "./requirement";
export interface EnvVarRequirement extends Requirement {
    envDef: EnvironmentDef[];
}