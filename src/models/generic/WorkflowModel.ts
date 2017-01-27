import {ValidationBase} from "../helpers/validation/ValidationBase";

import {StepModel} from "./StepModel";
import {WorkflowInputParameterModel} from "./WorkflowInputParameterModel";
import {WorkflowOutputParameterModel} from "./WorkflowOutputParameterModel";
import {Serializable} from "../interfaces/Serializable";
import {WorkflowStepInputModel} from "./WorkflowStepInputModel";
import {WorkflowStepOutputModel} from "./WorkflowStepOutputModel";

export class WorkflowModel extends ValidationBase implements Serializable<any> {
    public steps: StepModel[];
    public inputs: WorkflowInputParameterModel[];
    public outputs: WorkflowOutputParameterModel[];

    constructor(loc: string) {
        super(loc);
    }

    serialize(): any {
        console.warn("versioned class must override serialize() method");
        return undefined;
    }

    deserialize(attr: any): void {
        console.warn("versioned class must override deserialize(attr: any) method");
    }

    public gatherSources(): Array<WorkflowInputParameterModel | WorkflowStepOutputModel> {
        const stepOut = this.steps.reduce((acc, curr) => {
            return acc.concat(curr.out);
        }, []);

        return stepOut.concat(this.inputs);
    }

    public gatherDestinations(): Array<WorkflowOutputParameterModel | WorkflowStepInputModel> {
        const stepOut = this.steps.reduce((acc, curr) => {
            return acc.concat(curr.in);
        }, []);

        return stepOut.concat(this.outputs);
    }

    customProps: any;
}