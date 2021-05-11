import {CommandLineTool} from "../../mappings/v1.0/CommandLineTool";
import {V1ResourceRequirementModel} from "../v1.0/V1ResourceRequirementModel";
import {V1_1CommandLineToolModel} from "../v1.1/V1_1CommandLineToolModel";
import {V1_2ResourceRequirementModel} from "./V1_2ResourceRequirementModel";

export class V1_2CommandLineToolModel extends V1_1CommandLineToolModel {

    public resources: V1_2ResourceRequirementModel;

    public cwlVersion = "v1.2";

    public createRequirement(req, loc, eventHub): V1ResourceRequirementModel {
        return new V1_2ResourceRequirementModel(req, loc, eventHub);
    }

    serialize(): CommandLineTool {

        const base = super.serialize();
        base.cwlVersion = "v1.2";

        return base;

    }

}
