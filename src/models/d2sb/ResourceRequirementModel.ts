import {ProcessRequirementModel} from "./ProcessRequirementModel";
import {SBGCPURequirementClass} from "../../mappings/d2sb/SBGCPURequirement";
import {SBGMemRequirementClass, SBGMemRequirement} from "../../mappings/d2sb/SBGMemRequirement";
import {SBDraft2ExpressionModel} from "./SBDraft2ExpressionModel";
import {SBGCPURequirement} from "../../mappings/d2sb/SBGCPURequirement";
import {Validation} from "../helpers/validation/Validation";

export class ResourceRequirementModel extends ProcessRequirementModel {
    public class: SBGCPURequirementClass | SBGMemRequirementClass;
    public value: SBDraft2ExpressionModel;

    constructor(req: SBGCPURequirement | SBGMemRequirement, loc: string) {
        super(req, loc);
        this.deserialize(req);
    }

    deserialize(req: SBGCPURequirement | SBGMemRequirement) {
        this.class = req.class;
        this.value = new SBDraft2ExpressionModel(`${this.loc}.value`, req.value);
        this.value.setValidationCallback((err: Validation) => {this.updateValidity(err)});
    }

    serialize(): SBGCPURequirement | SBGMemRequirement {
        let base = <SBGCPURequirement | SBGMemRequirement>{};
        base.class = this.class;
        base.value = this.value.serialize();

        return base;
    }


}