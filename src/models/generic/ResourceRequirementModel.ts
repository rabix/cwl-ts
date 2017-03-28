import {ProcessRequirementModel} from "./ProcessRequirementModel";
import {ExpressionModel} from "./ExpressionModel";

export abstract class ResourceRequirementModel extends ProcessRequirementModel {
    class = "ResourceRequirement";

    mem: ExpressionModel;
    cores: ExpressionModel;
}