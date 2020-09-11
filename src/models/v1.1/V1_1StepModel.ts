import {V1StepModel} from "../v1.0/V1StepModel";
import {V1_1WorkflowStepInputModel} from "./V1_1WorkflowStepInputModel";
import {V1_1WorkflowStepOutputModel} from "./V1_1WorkflowStepOutputModel";

export class V1_1StepModel extends V1StepModel{

    public in: V1_1WorkflowStepInputModel[];
    public out: V1_1WorkflowStepOutputModel[];

    addWorkflowInput(input, index) {
        return new V1_1WorkflowStepInputModel(input, this, `${this.loc}.in[${index}]`, this.eventHub);
    }

    addWorkflowOutput(output, index) {
        return new V1_1WorkflowStepOutputModel(output, this, `${this.loc}.out[${index}]`);
    }

}
