import {SBGCPURequirementClass} from "../../mappings/d2sb/SBGCPURequirement";
import {SBGMemRequirementClass} from "../../mappings/d2sb/SBGMemRequirement";
import {SBDraft2ExpressionModel} from "./SBDraft2ExpressionModel";
import {EventHub} from "../helpers/EventHub";
import {ResourceRequirementModel} from "../generic/ResourceRequirementModel";

export class SBDraft2ResourceRequirementModel extends ResourceRequirementModel {
    public class: SBGCPURequirementClass | SBGMemRequirementClass;
    public value: SBDraft2ExpressionModel;

    mem: SBDraft2ExpressionModel;
    cores: SBDraft2ExpressionModel;

    constructor(loc?: string, eventHub?: EventHub) {
        super(loc, eventHub);

        this.mem = new SBDraft2ExpressionModel();
        this.cores = new SBDraft2ExpressionModel();
    }
}