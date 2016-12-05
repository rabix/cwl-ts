import {Expression} from "./Expression";
import {ProcessRequirement} from "./ProcessRequirement";
export type SBGCPURequirementClass = "sbg:CPURequirement"

export interface SBGCPURequirement  extends ProcessRequirement  {
    class: SBGCPURequirementClass;
    value: number | string | Expression
}