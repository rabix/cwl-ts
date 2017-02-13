import {StepModel} from "../generic/StepModel";
import {WorkflowModel} from "../generic/WorkflowModel";
import {CommandLineToolModel} from "../generic/CommandLineToolModel";
import {ExpressionToolModel} from "../generic/ExpressionToolModel";
import {SBDraft2WorkflowStepInputModel} from "./SBDraft2WorkflowStepInputModel";
import {SBDraft2WorkflowStepOutputModel} from "./SBDraft2WorkflowStepOutputModel";
import {WorkflowStep} from "../../mappings/d2sb/WorkflowStep";
import {ensureArray} from "../helpers/utils";

export class SBDraft2StepModel extends StepModel {
    id: string;
    description: string;
    label: string;
    run: WorkflowModel | CommandLineToolModel | ExpressionToolModel;
    "in": SBDraft2WorkflowStepInputModel[];
    out: SBDraft2WorkflowStepOutputModel[];
    hasMultipleScatter: false;
    hasScatterMethod: false;

    constructor(step?: WorkflowStep, loc?: string) {
        super(loc);

        if (step) this.deserialize(step);
    }

    serialize(): WorkflowStep {
        return super.serialize();
    }

    deserialize(step: WorkflowStep): void {
        const serializedKeys = [
            "id",
            "description",
            "label",
            "run",
            "scatter",
            "inputs",
            "outputs"
        ];

        this.in = ensureArray(step.inputs).map((step, index) => {
            return new SBDraft2WorkflowStepInputModel(step, this, `${this.loc}.inputs[${index}]`)
        });

        this.out = ensureArray(step.outputs).map((step, index) => {
            return new SBDraft2WorkflowStepOutputModel(step, this, `${this.loc}.outputs[${index}]`)
        });



    }
}