import {WorkflowModel} from "../generic/WorkflowModel";
import {Workflow} from "../../mappings/d2sb/Workflow";
import {BatchInput} from "../../mappings/d2sb/Workflow";
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
import {WorkflowInputParameterModel} from "../generic/WorkflowInputParameterModel";
import {SBDraft2ExpressionModel} from "./SBDraft2ExpressionModel";
import {ProcessRequirement} from "../generic/ProcessRequirement";
import {RequirementBaseModel} from "../generic/RequirementBaseModel";
import {Customizable} from '../interfaces/Customizable';

export class SBDraft2WorkflowModel extends WorkflowModel implements Serializable<Workflow> {
    public id: string;

    public cwlVersion = "sbg:draft-2";

    public steps: SBDraft2StepModel[] = [];

    public inputs: SBDraft2WorkflowInputParameterModel[] = [];

    public outputs: SBDraft2WorkflowOutputParameterModel[] = [];

    public hasBatch: boolean = true;

    constructor(workflow: Workflow, loc: string = "document") {
        super(loc);

        if (workflow) this.deserialize(workflow);

        this.graph = this.constructGraph();

        this.eventHub.on("io.change.id", (node, oldId)=> {
            if (node instanceof WorkflowInputParameterModel && this.batchInput === oldId) {
                this.batchInput = node.id;
            }
        });
    }


    public createInputFromPort(inPort: SBDraft2WorkflowStepInputModel | string,
                               data: Customizable = {}): SBDraft2WorkflowInputParameterModel {
        const port = super._createInputFromPort(inPort, SBDraft2WorkflowInputParameterModel, undefined, undefined, data);
        port.customProps["sbg:includeInPorts"] = true;
        return port;
    }

    public createOutputFromPort(outPort: SBDraft2WorkflowStepOutputModel
                                    | string, data: Customizable = {}): SBDraft2WorkflowOutputParameterModel {

        return super._createOutputFromPort(outPort, SBDraft2WorkflowOutputParameterModel, undefined, undefined, data);
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
        }, loc, this.eventHub);

        step.setValidationCallback(err => this.updateValidity(err));
        this.steps.push(step);

        step.id = this.getNextAvailableId(step.id);
        this.addStepToGraph(step);

        this.eventHub.emit("step.create", step);
        return step;
    }

    public setBatch(input: string, value: string | string []): void {

        if (!value || value === "none") {
            this.batchByValue = null;
            this.batchInput = null;
            return;
        }

        this.batchInput = input;
        this.batchByValue = value;
    }

    public addHint(hint?: ProcessRequirement | any): RequirementBaseModel {
        return this.createReq(hint, SBDraft2ExpressionModel, undefined, true);
    }

    public serializeEmbedded(retainSource: boolean = false): Workflow {
        return this._serialize(true, retainSource);
    }


    serialize(): Workflow {
        return this._serialize(false);
    }

    _serialize(embed: boolean, retainSource: boolean = false): Workflow {
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
                return s.serializeEmbedded(retainSource);
            } else {
                return s.serialize();
            }
        });

        if (this.hints.length) { base.hints = this.hints.map((hint) => hint.serialize())}

        if (this.batchInput) base["sbg:batchInput"] = "#" + this.batchInput;

        if (this.batchByValue) {

            const valueIsArray = Array.isArray(this.batchByValue);

            let batchBy : BatchInput = {
                type: valueIsArray ? "criteria" : "item"
            };

            if (valueIsArray) {
                batchBy.criteria = this.batchByValue as string [];
            }

            base["sbg:batchBy"] = batchBy;
        }

        return spreadAllProps(base, this.customProps);
    }

    deserialize(workflow: Workflow): void {
        const serializedKeys = [
            "id",
            "class",
            "cwlVersion",
            "steps",
            "inputs",
            "outputs",
            "label",
            "hints",
            "description",
            "sbg:batchBy",
            "sbg:batchInput"
        ];

        this.label       = workflow.label;
        this.description = workflow.description;

        this.id = workflow["sbg:id"] && workflow["sbg:id"].split("/").length > 2 ?
            workflow["sbg:id"].split("/")[2] :
            snakeCase(workflow.id);

        this.sbgId = workflow["sbg:id"];

        this.steps = ensureArray(workflow.steps).map((step, index) => {
            if (step.run && typeof step.run !== "string") {
                step.run.cwlVersion = step.run.cwlVersion || "sbg:draft-2";
            }
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

        this.hints = ensureArray(workflow.hints).map((hint, i) => {
            return this.createReq(hint, SBDraft2ExpressionModel, `${this.loc}.hints[${i}]`, true);
        });

        if (workflow["sbg:batchInput"]) {

            // Remove # in front of id
            if (workflow["sbg:batchInput"].indexOf("#") === 0) {
                this.batchInput = workflow["sbg:batchInput"].substring(1);
            }

            if (workflow["sbg:batchBy"].type === "item") {
                this.batchByValue = "item";
            } else {
                this.batchByValue = workflow["sbg:batchBy"].criteria;
            }
        } else {
            this.batchByValue = null;
            this.batchInput = null;
        }

        spreadSelectProps(workflow, this.customProps, serializedKeys);
    }
}

