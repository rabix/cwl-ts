import {WorkflowModel} from "../generic/WorkflowModel";
import {Workflow} from "../../mappings/d2sb/Workflow";
import {SBDraft2StepModel} from "./SBDraft2StepModel";
import {SBDraft2WorkflowInputParameterModel} from "./SBDraft2WorkflowInputParameterModel";
import {SBDraft2WorkflowOutputParameterModel} from "./SBDraft2WorkflowOutputParameterModel";
import {Serializable} from "../interfaces/Serializable";
import {ensureArray, spreadSelectProps} from "../helpers/utils";
import {STEP_OUTPUT_CONNECTION_PREFIX} from "../helpers/constants";
import {SBDraft2WorkflowStepInputModel} from "./SBDraft2WorkflowStepInputModel";
import {Process as SBDraft2Process} from "../../mappings/d2sb/Process";

export class SBDraft2WorkflowModel extends WorkflowModel implements Serializable<Workflow> {
    public id: string;

    public cwlVersion = "sbg:draft-2";

    public steps: SBDraft2StepModel[] = [];

    public inputs: SBDraft2WorkflowInputParameterModel[] = [];

    public outputs: SBDraft2WorkflowOutputParameterModel[] = [];

    constructor(workflow: Workflow, loc: string) {
        super(loc || "document");

        if (workflow) this.deserialize(workflow);

        this.graph = this.constructGraph();
        console.log(this.graph);
        console.log(Array.from(this.graph.edges).filter(function(edge) { return edge.isVisible;}));
    }

    public exposePort(inPort: SBDraft2WorkflowStepInputModel) {
        super._exposePort(inPort, SBDraft2WorkflowInputParameterModel);
    }

    protected getSourceConnectionId(source: string): string {
        // source comes from a step
        if (/[.]+/.test(source)) {
            let [step, id] = source.split(".");
            step = step.charAt(0) === "#" ? step.substr(1) : step;
            return `${STEP_OUTPUT_CONNECTION_PREFIX}${step}/${id}`;
        } else {
            const s = source.charAt(0) === "#" ? source.substr(1) : source;
            return `${STEP_OUTPUT_CONNECTION_PREFIX}${s}/${s}`
        }
    }

    public addStepFromProcess(proc: SBDraft2Process): SBDraft2StepModel {
        return this._addStepFromProcess(proc, SBDraft2StepModel);
    }

    serialize(): Workflow {
        return super.serialize();
    }

    deserialize(workflow: Workflow): void {
        const serializedKeys = ["id", "class", "cwlVersion", "steps", "inputs", "outputs"];

        this.id = workflow.id;

        this.steps = ensureArray(workflow.steps).map((step, index) => {
            const stepModel = new SBDraft2StepModel(step, `${this.loc}.steps[${index}]`);
            stepModel.setValidationCallback(err => {
                this.updateValidity(err)
            });
            return stepModel;
        });

        this.inputs = ensureArray(workflow.inputs).map((input, index) => {
            const inputParameterModel = new SBDraft2WorkflowInputParameterModel(input, `${this.loc}.inputs[${index}]`);
            inputParameterModel.setValidationCallback(err => {
                this.updateValidity(err)
            });
            return inputParameterModel;
        });

        this.outputs = ensureArray(workflow.outputs).map((output, index) => {
            const outputParameterModel = new SBDraft2WorkflowOutputParameterModel(output, `${this.loc}.outputs[${index}]`);
            outputParameterModel.setValidationCallback(err => {
                this.updateValidity(err)
            });
            return outputParameterModel;
        });

        spreadSelectProps(workflow, this.customProps, serializedKeys);
    }
}

