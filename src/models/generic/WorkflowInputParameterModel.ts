import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {ParameterTypeModel} from "../d2sb/ParameterTypeModel";

export class WorkflowInputParameterModel extends ValidationBase implements Serializable<any> {
    id: string;
    type: ParameterTypeModel;

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