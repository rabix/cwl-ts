import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {InputParameterTypeModel} from "./InputParameterTypeModel";
import {InputParameter} from "./InputParameter";
import {Plottable} from "./Plottable";

export class WorkflowInputParameterModel extends ValidationBase implements InputParameter, Serializable<any>, Plottable{
    id: string;
    type: InputParameterTypeModel;
    fileTypes?: string[];

    isField: boolean;

    isVisible = true;

    get connectionId(): string {
        return this.id;
    }

    customProps: any = {};

    serialize(): any {
        return null;
    }

    deserialize(attr: any): void {
    }
}