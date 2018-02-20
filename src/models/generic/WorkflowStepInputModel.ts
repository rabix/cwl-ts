import {LinkMerge} from "../elements/link-merge";
import {STEP_INPUT_CONNECTION_PREFIX} from "../helpers/constants";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {ExpressionModel} from "./ExpressionModel";
import {ParameterTypeModel} from "./ParameterTypeModel";
import {Plottable} from "./Plottable";
import {StepModel} from "./StepModel";

export class WorkflowStepInputModel extends ValidationBase implements Serializable<any>, Plottable {
    id: string;
    'default': any;
    valueFrom: ExpressionModel;
    source: string[] = [];
    linkMerge: LinkMerge;
    label: string;
    description: string;

    type: ParameterTypeModel;
    fileTypes: string[] = [];

    constructor(loc?: string){
        super(loc);
    }

    parentStep: StepModel;

    /**
     * The connectionId used within the graph, prefix with "in/" because it refers to the
     */
    get connectionId(): string {
        return `${STEP_INPUT_CONNECTION_PREFIX}${this.parentStep.id}/${this.id}`;
    }

    /**
     * The input's ID for scatter
     * @returns {string}
     */
    get destinationId(): string {
        return `${this.parentStep.id}/${this.id}`;
    }

    public get status(): "port" | "default" | "exposed" {
        //  A port is displayed on canvas (if it has connections or
        // if it is required file, by default)
        if (this.isVisible) return "port";

        // Neither included in ports nor "exposed"
        if (!this.source.length) return "default";

        // An in port is "exposed" when it isn't visible but has
        // a workflow input to which it is solely connected
        if (this.source.length === 1) return "exposed";
    }

    public isVisible = false;

    customProps: any = {};

    serialize(): any {
        new UnimplementedMethodException("serialize");
    }

    deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize");
    }
}