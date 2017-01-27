import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {Expression} from "../../mappings/v1.0/Expression";
import {LinkMergeMethod} from "../../mappings/v1.0/LinkMergeMethod";

export class WorkflowStepInputModel extends ValidationBase implements Serializable<any> {
    id: string;
    'default': any;
    valueFrom: string | Expression;
    source: string | string[];
    linkMerge: LinkMergeMethod;

    customProps: any = {};

    serialize(): any {
        return undefined;
    }

    deserialize(attr: any): void {
    }

}