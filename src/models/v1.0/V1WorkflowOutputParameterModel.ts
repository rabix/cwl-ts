import {WorkflowOutputParameterModel} from "../generic/WorkflowOutputParameterModel";
import {WorkflowOutputParameter} from "../../mappings/v1.0/WorkflowOutputParameter";

export class V1WorkflowOutputParameterModel extends WorkflowOutputParameterModel {

    constructor(output?, loc?: string) {
        super(loc);
        if (output) this.deserialize(output);
    }

    deserialize(output: WorkflowOutputParameter) {
        this.id = output.id;
        this.source = output.outputSource;
    }

    serialize(): WorkflowOutputParameter {
        return {
            id: this.id,
            outputSource: this.source
        };
    }

}