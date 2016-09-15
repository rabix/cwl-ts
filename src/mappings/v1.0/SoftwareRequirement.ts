import {ProcessRequirement} from "./ProcessRequirement";
import {SoftwarePackage} from "./SoftwarePackage";


/**
 * A list of software packages that should be configured in the environment of
 * the defined process.
 *
 */

export interface SoftwareRequirement extends ProcessRequirement {


    /**
     * Always 'SoftwareRequirement'
     */
        class: string;


    /**
     * The list of software to be configured.
     */
    packages: SoftwarePackage[];

}