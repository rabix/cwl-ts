import {CWLVersion, Workflow} from "../../mappings/v1.0";
import {Process} from "../generic/Process";
import {Customizable} from "../interfaces/Customizable";
import {V1WorkflowOutputParameterModel} from "../v1.0";
import {V1WorkflowStepOutputModel} from "../v1.0/V1WorkflowStepOutputModel";
import {V1_1WorkflowModel} from "../v1.1/V1_1WorkflowModel";
import {V1_2StepModel} from "./V1_2StepModel";
import {V1_2WorkflowOutputParameterModel} from "./V1_2WorkflowOutputParameterModel";

export class V1_2WorkflowModel extends V1_1WorkflowModel {

    cwlVersion: CWLVersion = "v1.2";

    steps: V1_2StepModel[];

    constructor(workflow?: Workflow, loc?: string) {
        super(workflow, loc);
    }

    addStep(step, index) {
        if (step.run && typeof step.run !== "string") {
            step.run.cwlVersion = step.run.cwlVersion || "v1.2";
        }
        this.addEntry(new V1_2StepModel(step, `${this.loc}.steps[${index}]`, this.eventHub), "steps");
    }

    addOutput(output, index) {
        this.addEntry(
            new V1_2WorkflowOutputParameterModel(
                output,
                `${this.loc}.outputs[${index}]`,
                this.eventHub), "outputs");
    }


    createOutputFromPort(outPort: V1WorkflowStepOutputModel
        | string, data: Customizable = {}): V1WorkflowOutputParameterModel {

        return super._createOutputFromPort(outPort, V1_2WorkflowOutputParameterModel, undefined, undefined, data);
    }

    createStepFromProcess(proc: Process, loc) {
        return new V1_2StepModel({
            in: [],
            out: [],
            run: proc
        }, loc, this.eventHub);
    }

    addStepFromProcess(proc: Process): V1_2StepModel {
        const loc = `${this.loc}.steps[${this.steps.length}]`;
        const step = new V1_2StepModel({
            in: [],
            out: [],
            run: proc
        }, loc, this.eventHub);

        step.setValidationCallback(err => this.updateValidity(err));
        this.steps.push(step);

        step.id = this.getNextAvailableId(step.id);
        this.addStepToGraph(step);

        this.eventHub.emit("step.create", step);
        return step;
    }

    _serialize(embed: boolean, retainSource: boolean = false): Workflow {

        const base = super._serialize(embed, retainSource);

        base.cwlVersion = this.cwlVersion;

        return base;
    }


}
