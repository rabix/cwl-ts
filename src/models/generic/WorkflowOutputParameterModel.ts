import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {OutputParameterTypeModel} from "./OutputParameterTypeModel";
import {Plottable} from "./Plottable";

export class WorkflowOutputParameterModel extends ValidationBase implements Serializable<any>, Plottable {
    public id: string;
    public source: string | string[];
    public type: OutputParameterTypeModel;

    public isVisible = true;

    get connectionId(): string {
        return this.id;
    }

    customProps: any = {};

    serialize(): any {
        return undefined;
    }

    deserialize(attr: any): void {
    }
}