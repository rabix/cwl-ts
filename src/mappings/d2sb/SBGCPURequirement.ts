import {Expression} from "./Expression";
export type SBGCPURequirementClass = "sbg:CPURequirement"

export interface SBGCPURequirement {
    class: SBGCPURequirementClass;
    value: string | Expression
}