import {ProcessRequirementModel} from "./ProcessRequirementModel";
import {ExpressionModel} from "./ExpressionModel";
import {EventHub} from "../helpers/EventHub";

export abstract class ResourceRequirementModel extends ProcessRequirementModel {
    class = "ResourceRequirement";

    mem: ExpressionModel;
    cores: ExpressionModel;

    constructor(loc?: string, protected eventHub?: EventHub) {
        super(loc);
    }
}