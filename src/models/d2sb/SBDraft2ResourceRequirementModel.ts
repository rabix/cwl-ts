import {SBGCPURequirementClass} from "../../mappings/d2sb/SBGCPURequirement";
import {SBGMemRequirementClass} from "../../mappings/d2sb/SBGMemRequirement";
import {ResourceRequirementModel} from "../generic/ResourceRequirementModel";
import {EventHub} from "../helpers/EventHub";
import {incrementString} from "../helpers/utils";
import {SBDraft2ExpressionModel} from "./SBDraft2ExpressionModel";

export class SBDraft2ResourceRequirementModel extends ResourceRequirementModel {
    public class: SBGCPURequirementClass | SBGMemRequirementClass;
    public value: SBDraft2ExpressionModel;

    mem: SBDraft2ExpressionModel;
    cores: SBDraft2ExpressionModel;

    constructor(loc?: string, eventHub?: EventHub) {
        super(loc, eventHub);

        const locBase = this.loc.slice(0, -1);

        this.mem = new SBDraft2ExpressionModel("", `${locBase}].value`, this.eventHub);
        this.mem.setValidationCallback(ev => this.updateValidity(ev));
        this.cores = new SBDraft2ExpressionModel("", `${incrementString(locBase)}].value`, this.eventHub);
        this.cores.setValidationCallback(ev => this.updateValidity(ev));
    }
}