import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {InputParameterTypeModel} from "./InputParameterTypeModel";
import {InputParameter} from "./InputParameter";
import {Plottable} from "./Plottable";

export class WorkflowInputParameterModel extends ValidationBase implements InputParameter, Serializable<any>, Plottable {
    id: string;
    type: InputParameterTypeModel;
    fileTypes?: string[];

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
        return this.id;
    }

    customProps: any = {};

    serialize(): any {
        return null;
    }

    deserialize(attr: any): void {
    }
}