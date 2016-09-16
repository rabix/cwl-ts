import {Expression} from "./Expression";
type SBGCPURequirementClass = "sbg:CPURequirement"

export interface SBGCPURequirement {
    class: SBGCPURequirementClass;
    value: string | Expression
}