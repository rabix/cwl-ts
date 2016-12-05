import {Expression} from "./Expression";
import {ProcessRequirement} from "./ProcessRequirement";
export type SBGMemRequirementClass = "SBGMemRequirement";

export interface SBGMemRequirement  extends ProcessRequirement {
    class: SBGMemRequirementClass;
    value: string | Expression;
}