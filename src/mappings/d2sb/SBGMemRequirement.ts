import {Expression} from "./Expression";
type SBGMemRequirementClass = "SBGMemRequirement";

export interface SBGMemRequirement {
    class: SBGMemRequirementClass;
    value: string | Expression;
}