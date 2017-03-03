import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {InputParameterTypeModel} from "./InputParameterTypeModel";
import {InputParameter} from "./InputParameter";
import {Plottable} from "./Plottable";
import {STEP_OUTPUT_CONNECTION_PREFIX} from "../helpers/constants";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";

export class WorkflowInputParameterModel extends ValidationBase implements InputParameter, Serializable<any>, Plottable {
    id: string;
    type: InputParameterTypeModel;
    fileTypes: string[] = [];

    label?: string;
    description?: string;

    isField: boolean;

    isVisible = true;

    /**
     * ID to be used when adding as source
     */
    get sourceId(): string {
        return this.id;
    }

    /**
     * ID to be used in graph
     */
    get connectionId(): string {
        return `${STEP_OUTPUT_CONNECTION_PREFIX}${this.id}/${this.id}`;
    }

    customProps: any = {};

    serialize(): any {
        new UnimplementedMethodException("serialize", "WorkflowInputParameterModel");
    }

    deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize", "WorkflowInputParameterModel");
    }
}