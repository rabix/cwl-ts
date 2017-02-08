import {ValidationBase} from "../helpers/validation/ValidationBase";
import {StepModel} from "./StepModel";
import {OutputParameterTypeModel} from "./OutputParameterTypeModel";
import {Plottable} from "./Plottable";

export class WorkflowStepOutputModel extends ValidationBase implements Plottable {
    isVisible = true;

    get connectionId(): string {
        return `${this.parentStep.id}/${this.id}`;
    }

    type?: OutputParameterTypeModel;
    fileTypes?: string[];

    parentStep: StepModel;
    id: string;
}