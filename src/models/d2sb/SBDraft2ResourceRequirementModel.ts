import {ProcessRequirementModel} from "../generic/ProcessRequirementModel";
import {SBGCPURequirementClass} from "../../mappings/d2sb/SBGCPURequirement";
import {SBGMemRequirementClass} from "../../mappings/d2sb/SBGMemRequirement";
import {SBDraft2ExpressionModel} from "./SBDraft2ExpressionModel";

export class SBDraft2ResourceRequirementModel extends ProcessRequirementModel {
    public class: SBGCPURequirementClass | SBGMemRequirementClass;
    public value: SBDraft2ExpressionModel;

    mem: SBDraft2ExpressionModel;
    cores: SBDraft2ExpressionModel;

    constructor(loc?: string) {
        super(loc);

        this.mem = new SBDraft2ExpressionModel();
        this.cores = new SBDraft2ExpressionModel();
    }
}