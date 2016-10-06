import {Expression} from "./Expression";
export type SBGMemRequirementClass = "SBGMemRequirement";

export interface SBGMemRequirement {
    class: SBGMemRequirementClass;
    value: string | Expression;
}