import {Expression} from "./Expression";
import {ProcessRequirement} from "./ProcessRequirement";
export type SBGMemRequirementClass = "sbg:MemRequirement";

export interface SBGMemRequirement  extends ProcessRequirement {
    class: SBGMemRequirementClass;
    value: number | string | Expression;
}