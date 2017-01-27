import {WorkflowStepInputModel} from "../generic/WorkflowStepInputModel"
import {WorkflowStepInput} from "../../mappings/v1.0/WorkflowStepInput";
import {Serializable} from "../interfaces/Serializable";
import {V1StepModel} from "./V1StepModel";

export class V1WorkflowStepInputModel extends WorkflowStepInputModel implements Serializable<WorkflowStepInput> {
    constructor(stepInput?: WorkflowStepInput, step?: V1StepModel, loc?: string) {
        super(loc);
        this.parentStep = step;

        if (stepInput) this.deserialize(stepInput);
    }

    serialize(): WorkflowStepInput {
        return undefined;
    }

    deserialize(attr: WorkflowStepInput): void {
        this.id      = attr.id;
        this.default = attr.default;
        this.source  = attr.source;

    }

}