import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";

export class WorkflowOutputParameterModel extends ValidationBase implements Serializable<any> {
    customProps: any = {};

    serialize(): any {
        return undefined;
    }

    deserialize(attr: any): void {
    }


}