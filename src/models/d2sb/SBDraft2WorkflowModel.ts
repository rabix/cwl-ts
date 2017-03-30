import {WorkflowModel} from "../generic/WorkflowModel";
import {Workflow} from "../../mappings/d2sb/Workflow";
import {SBDraft2StepModel} from "./SBDraft2StepModel";
import {SBDraft2WorkflowInputParameterModel} from "./SBDraft2WorkflowInputParameterModel";
import {SBDraft2WorkflowOutputParameterModel} from "./SBDraft2WorkflowOutputParameterModel";
import {Serializable} from "../interfaces/Serializable";
import {ensureArray, snakeCase, spreadAllProps, spreadSelectProps} from "../helpers/utils";
import {STEP_OUTPUT_CONNECTION_PREFIX} from "../helpers/constants";
import {SBDraft2WorkflowStepInputModel} from "./SBDraft2WorkflowStepInputModel";
import {Process} from "../../mappings/d2sb/Process";
import {SBDraft2WorkflowStepOutputModel} from "./SBDraft2WorkflowStepOutputModel";
import {SBGWorkflowInputParameter} from "../../mappings/d2sb/SBGWorkflowInputParameter";
import {WorkflowOutputParameter} from "../../mappings/d2sb/WorkflowOutputParameter";

export class SBDraft2WorkflowModel extends WorkflowModel implements Serializable<Workflow> {
    public id: string;

    public cwlVersion = "sbg:draft-2";

    public steps: SBDraft2StepModel[] = [];

    public inputs: SBDraft2WorkflowInputParameterModel[] = [];

    public outputs: SBDraft2WorkflowOutputParameterModel[] = [];

    private sbgId: string;

    constructor(workflow: Workflow, loc: string) {
        super(loc || "document");

        if (workflow) this.deserialize(workflow);

        this.graph = this.constructGraph();
    }


    public createInputFromPort(inPort: SBDraft2WorkflowStepInputModel
                                   | string): SBDraft2WorkflowInputParameterModel {
        return super._createInputFromPort(inPort, SBDraft2WorkflowInputParameterModel);
    }

    public createOutputFromPort(outPort: SBDraft2WorkflowStepOutputModel
                                    | string): SBDraft2WorkflowOutputParameterModel {
        return super._createOutputFromPort(outPort, SBDraft2WorkflowOutputParameterModel);
    }

    public exposePort(inPort: SBDraft2WorkflowStepInputModel) {
        super._exposePort(inPort, SBDraft2WorkflowInputParameterModel);
    }

    protected getSourceConnectionId(source: string): string {
        // source comes from a step
        if (/[.]+/.test(source)) {
            let [step, id] = source.split(".");
            step           = step.charAt(0) === "#" ? step.substr(1) : step;
            return `${STEP_OUTPUT_CONNECTION_PREFIX}${step}/${id}`;
        } else {
            const s = source.charAt(0) === "#" ? source.substr(1) : source;
            return `${STEP_OUTPUT_CONNECTION_PREFIX}${s}/${s}`
        }
    }

    /**
     * Checks if source contains stepId.
     * If it does, returns id of step.out, else null;
     * @param source
     * @param stepId
     */
    protected isSourceFromStep(source: string, stepId: string): string {
        if (/[.]+/.test(source)) {
            const split = source.split('.');
            if (split[0] === "#" + stepId) return split[1];

            return null;
        }

        return null;
    }

    public addStepFromProcess(proc: Process): SBDraft2StepModel {
        const loc  = `${this.loc}.steps[${this.steps.length}]`;
        const step = new SBDraft2StepModel({
            inputs: [],
            outputs: [],
            run: proc
        }, loc);

        step.setValidationCallback(err => this.updateValidity(err));
        this.steps.push(step);

        step.id = this.getNextAvailableId(step.id);
        this.addStepToGraph(step);

        this.eventHub.emit("step.create", step);
        return step;
    }

    public serializeEmbedded(): Workflow {
        return this._serialize(false);
    }


    serialize(): Workflow {
        return this._serialize(false);
    }

    _serialize(embed: boolean): Workflow {
        const base: Workflow = <Workflow>{};

        base.class = "Workflow";
        base.cwlVersion = "sbg:draft-2";

        if (this.sbgId || this.id) {
            base.id = this.sbgId || this.id;
        }

        if (this.label) base.label = this.label;
        if (this.description) base.description = this.description;

        base.inputs = <SBGWorkflowInputParameter[]> this.inputs.map(i => i.serialize());
        base.outputs = <WorkflowOutputParameter[]>this.outputs.map(o => o.serialize());
        base.steps = this.steps.map(s => {
            if (embed) {
                return s.serializeEmbedded();
            } else {
                return s.serialize();
            }
        });

        return spreadAllProps(base, this.customProps);
    }

    deserialize(workflow: Workflow): void {
        const serializedKeys = ["id", "class", "cwlVersion", "steps", "inputs", "outputs", "label", "description"];

        this.label       = workflow.label;
        this.description = workflow.description;

        this.id = workflow["sbg:id"] && workflow["sbg:id"].split("/").length > 3 ?
            workflow["sbg:id"].split("/")[2] :
            snakeCase(workflow.id);

        this.sbgId = workflow["sbg:id"];

        this.steps = ensureArray(workflow.steps).map((step, index) => {
            const stepModel = new SBDraft2StepModel(step, `${this.loc}.steps[${index}]`, this.eventHub);
            stepModel.setValidationCallback(err => {
                this.updateValidity(err)
            });
            return stepModel;
        });

        this.inputs = ensureArray(workflow.inputs).map((input, index) => {
            const inputParameterModel = new SBDraft2WorkflowInputParameterModel(input, `${this.loc}.inputs[${index}]`, this.eventHub);
            inputParameterModel.setValidationCallback(err => {
                this.updateValidity(err)
            });
            return inputParameterModel;
        });

        this.outputs = ensureArray(workflow.outputs).map((output, index) => {
            const outputParameterModel = new SBDraft2WorkflowOutputParameterModel(output, `${this.loc}.outputs[${index}]`, this.eventHub);
            outputParameterModel.setValidationCallback(err => {
                this.updateValidity(err)
            });
            return outputParameterModel;
        });

        spreadSelectProps(workflow, this.customProps, serializedKeys);
    }
}

