import {ValidationBase} from "../helpers/validation/ValidationBase";
import {StepModel} from "./StepModel";
import {OutputParameterTypeModel} from "./OutputParameterTypeModel";
import {Plottable} from "./Plottable";
import {Serializable} from "../interfaces/Serializable";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {STEP_OUTPUT_CONNECTION_PREFIX} from "../helpers/constants";

export class WorkflowStepOutputModel extends ValidationBase implements Plottable, Serializable<any> {
    customProps: any;

    serialize(): any {
        new UnimplementedMethodException("serialize");
    }

    deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize");
    }

    isVisible = true;

    get connectionId(): string {
        return `${STEP_OUTPUT_CONNECTION_PREFIX}${this.parentStep.id}/${this.id}`;
    }

    type?: OutputParameterTypeModel;
    fileTypes?: string[];

    parentStep: StepModel;
    id: string;
}