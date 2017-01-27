import {WorkflowStepInputModel as BaseWorkflowStepInputModel} from "../generic/WorkflowStepInputModel"
import {WorkflowStepInput} from "../../mappings/v1.0/WorkflowStepInput";
import {Serializable} from "../interfaces/Serializable";

export class WorkflowStepInputModel extends BaseWorkflowStepInputModel implements Serializable<WorkflowStepInput> {
    constructor(stepInput?: WorkflowStepInput, loc?: string) {
        super(loc);

        if (stepInput) this.deserialize(stepInput);
    }

    serialize(): WorkflowStepInput {
        return undefined;
    }

    deserialize(attr: WorkflowStepInput): void {
        this.id = attr.id;
        this.default = attr.default;
        this.source = attr.source;

    }

}