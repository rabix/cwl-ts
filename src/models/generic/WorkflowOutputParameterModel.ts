import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {OutputParameterTypeModel} from "./OutputParameterTypeModel";
import {Plottable} from "./Plottable";
import {STEP_INPUT_CONNECTION_PREFIX} from "../helpers/constants";

export class WorkflowOutputParameterModel extends ValidationBase implements Serializable<any>, Plottable {
    public id: string;
    public source: string | string[];
    public type: OutputParameterTypeModel;
    public description: string;
    public label: string;
    public secondaryFiles: string[];

    public isVisible = true;

    get connectionId(): string {
        return `${STEP_INPUT_CONNECTION_PREFIX}${this.id}/${this.id}`;
    }

    customProps: any = {};

    serialize(): any {
        return undefined;
    }

    deserialize(attr: any): void {
    }
}