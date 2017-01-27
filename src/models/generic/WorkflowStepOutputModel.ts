import {ValidationBase} from "../helpers/validation/ValidationBase";
import {StepModel} from "./StepModel";

export class WorkflowStepOutputModel extends ValidationBase {
    get connectionId(): string {
        return `${this.parentStep.id}/${this.id}`;
    }

    parentStep: StepModel;
    id: string;
}