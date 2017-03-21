import {ValidationBase} from "../helpers/validation/ValidationBase";
import {StepModel} from "./StepModel";
import {Plottable} from "./Plottable";
import {Serializable} from "../interfaces/Serializable";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {STEP_OUTPUT_CONNECTION_PREFIX} from "../helpers/constants";
import {ParameterTypeModel} from "./ParameterTypeModel";

export class WorkflowStepOutputModel extends ValidationBase implements Plottable, Serializable<any> {
    type?: ParameterTypeModel;
    fileTypes: string[] = [];
    label?: string;
    description?: string;

    parentStep: StepModel;
    id: string;

    customProps: any = {};

    serialize(): any {
        new UnimplementedMethodException("serialize");
    }

    deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize");
    }

    isVisible = true;

    /**
     * ID used for creating connections
     */
    get sourceId(): string {
        return `${this.parentStep.id}/${this.id}`;
    }

    /**
     * ID used for graph
     */
    get connectionId(): string {
        return `${STEP_OUTPUT_CONNECTION_PREFIX}${this.parentStep.id}/${this.id}`;
    }
}