import {WorkflowStepOutputModel as BaseWorkflowStepOutputModel} from "../generic/WorkflowStepOutputModel";
import {WorkflowStepOutput} from "../../mappings/v1.0/WorkflowStepOutput";
import {Serializable} from "../interfaces/Serializable";

export class WorkflowStepOutputModel extends BaseWorkflowStepOutputModel implements Serializable<WorkflowStepOutput>{
    constructor(output?, loc?: string) {
        super(loc);
        if (output) this.deserialize(output);
    }

    customProps: any;

    serialize(): WorkflowStepOutput {
        return {
            id: this.id
        }
    }

    deserialize(output: WorkflowStepOutput): void {
        this.id = output.id;
    }
}