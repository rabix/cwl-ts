import {StepModel as BaseStepModel} from "../generic/StepModel";
import {WorkflowStep} from "../../mappings/v1.0/WorkflowStep";
import {Serializable} from "../interfaces/Serializable";
import {WorkflowStepInputModel} from "./WorkflowStepInputModel";
import {WorkflowStepOutputModel} from "./WorkflowStepOutputModel";
import {ensureArray} from "../helpers/utils";

export class StepModel extends BaseStepModel implements Serializable<WorkflowStep> {


    constructor(step?, loc?: string) {
        super(loc);
        if (step) this.deserialize(step);
    }

    serialize(): WorkflowStep {
        return undefined;
    }

    deserialize(step: WorkflowStep): void {
        const serializedKeys = [
            "id",
            "doc",
            "label",
            "run",
            "scatter",
            "scatterMethod",
            "in",
            "out"
        ];

        this.id    = step.id;
        this.doc   = step.doc;
        this.label = step.label;
        this.run   = step.run; //@todo: parse into appropriate data structure


        this.in  = ensureArray(step.in, "id", "source")
            .map((i, index) => new WorkflowStepInputModel(i, `${this.loc}.in[${index}]`));
        this.out = ensureArray(step.out, "id")
            .map((o, index) => new WorkflowStepOutputModel(o, `${this.loc}.out[${index}]`));

        //@todo: generalize and parse requirements and hints
        this.requirements = ensureArray(step.requirements, "class");
        this.hints        = ensureArray(step.hints, "class");

        this.scatter       = step.scatter;
        this.scatterMethod = step.scatterMethod;

        Object.keys(step).forEach(key => {
            if (serializedKeys.indexOf(key) === -1) {
                this.customProps[key] = step[key];
            }
        })
    }
}