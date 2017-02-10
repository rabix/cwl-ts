import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {Expression} from "../../mappings/v1.0/Expression";
import {LinkMergeMethod} from "../../mappings/v1.0/LinkMergeMethod";
import {StepModel} from "./StepModel";
import {InputParameterTypeModel} from "./InputParameterTypeModel";
import {Plottable} from "./Plottable";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {STEP_INPUT_CONNECTION_PREFIX} from "../helpers/constants";

export class WorkflowStepInputModel extends ValidationBase implements Serializable<any>, Plottable {
    id: string;
    'default': any;
    valueFrom: string | Expression;
    source: string[] = [];
    linkMerge: LinkMergeMethod;

    type?: InputParameterTypeModel;
    fileTypes?: string[];

    constructor(input?: any, loc?: string){
        super(loc);
    }

    parentStep: StepModel;

    /**
     * The connectionId used within the graph, prefix with "in/" because it refers to the
     */
    get connectionId(): string {
        return `${STEP_INPUT_CONNECTION_PREFIX}${this.parentStep.id}/${this.id}`;
    }

    isVisible: boolean;

    isExposed: boolean;

    customProps: any = {};

    serialize(): any {
        throw new UnimplementedMethodException("serialize");
    }

    deserialize(attr: any): void {
        throw new UnimplementedMethodException("deserialize");
    }

}