import {WorkflowOutputParameterModel} from "../generic/WorkflowOutputParameterModel";
import {WorkflowOutputParameter} from "../../mappings/v1.0/WorkflowOutputParameter";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";

export class V1WorkflowOutputParameterModel extends WorkflowOutputParameterModel {

    constructor(output?, loc?: string) {
        super(loc);
        if (output) this.deserialize(output);
    }

    deserialize(output: WorkflowOutputParameter) {
        this.id = output.id;
        this.source = output.outputSource;
        this.type = new ParameterTypeModel(output.type, V1WorkflowOutputParameterModel, `${this.loc}.type`);
    }

    serialize(): WorkflowOutputParameter {
        return {
            id: this.id,
            outputSource: this.source
        };
    }

}