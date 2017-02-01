import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {OutputParameterTypeModel} from "./OutputParameterTypeModel";

export class WorkflowOutputParameterModel extends ValidationBase implements Serializable<any> {
    id: string;
    source: string | string[];
    type: OutputParameterTypeModel;

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