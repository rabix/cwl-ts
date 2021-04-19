import {WorkflowStep} from "../../mappings/v1.0";
import {V1ExpressionModel} from "../v1.0";
import {V1_1StepModel} from "../v1.1/V1_1StepModel";
import {V1_2WorkflowStepInputModel} from "./V1_2WorkflowStepInputModel";

export class V1_2StepModel extends V1_1StepModel {

    public in: V1_2WorkflowStepInputModel[];

    when: V1ExpressionModel;

    addWorkflowInput(input, index) {
        return new V1_2WorkflowStepInputModel(input, this, `${this.loc}.in[${index}]`, this.eventHub);
    }

    createWorkflowStepInputModel(input, index) {
        return new V1_2WorkflowStepInputModel(input, this, `${this.loc}.in[${index}]`, this.eventHub);
    }

    setRunCondition(value: string) {
        this.when = new V1ExpressionModel(value, `${this.loc}.when`, this.eventHub);
        this.when.setValidationCallback(err => this.updateValidity(err));
    }


    _serialize(embed: boolean, retainSource: boolean = false): WorkflowStep {
        const base: any = super._serialize(embed, retainSource);
        const when = this.when.serialize();

        (when && (base.when = when)) || delete base.when;

        return base;
    }

    deserialize(step: WorkflowStep): void {
        super.deserialize(step);

        const when = (step as any).when;
        this.when = new V1ExpressionModel(`${when || ''}`, `${this.loc}.when`, this.eventHub);
        this.when.setValidationCallback(err => this.updateValidity(err));
    }
}
