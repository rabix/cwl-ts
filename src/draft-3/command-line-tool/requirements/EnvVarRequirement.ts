import {EnvironmentDef} from "../EnvironmentDef";
import {BaseRequirement} from "./BaseRequirement";
export interface EnvVarRequirement extends BaseRequirement {
    envDef: EnvironmentDef[];
}