import {ProcessRequirement} from "./ProcessRequirement";
import {EnvironmentDef} from "./EnvironmentDef";


/**
 * Define a list of environment variables which will be set in the
 * execution environment of the tool.  See `EnvironmentDef` for details.
 *
 */

export interface EnvVarRequirement extends ProcessRequirement {


    /**
     * Always 'EnvVarRequirement'
     */
        class: string;


    /**
     * The list of environment variables.
     */
    envDef: EnvironmentDef[];

}