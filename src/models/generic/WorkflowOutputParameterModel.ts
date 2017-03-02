import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {Plottable} from "./Plottable";
import {STEP_INPUT_CONNECTION_PREFIX} from "../helpers/constants";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {ParameterTypeModel} from "./ParameterTypeModel";

export class WorkflowOutputParameterModel extends ValidationBase implements Serializable<any>, Plottable {
    public id: string;
    public source: string[];
    public type: ParameterTypeModel;
    public description: string;
    public label: string;
    public secondaryFiles: string[];
    public fileTypes: string[] = [];

    public isVisible = true;

    get destinationId(): string {
        return this.id;
    }

    get connectionId(): string {
        return `${STEP_INPUT_CONNECTION_PREFIX}${this.id}/${this.id}`;
    }

    customProps: any = {};

    serialize(): any {
        new UnimplementedMethodException("serialize", "WorkflowOutputParameterModel");
    }

    deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize", "WorkflowOutputParameterModel");
    }
}