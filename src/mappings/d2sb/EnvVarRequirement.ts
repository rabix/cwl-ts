import {ProcessRequirement} from "./ProcessRequirement";
import {EnvironmentDef} from "./EnvironmentDef";

export interface EnvVarRequirement extends ProcessRequirement {
    class: string;
    envDef: EnvironmentDef[];
}
