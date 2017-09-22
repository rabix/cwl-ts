import {WorkflowModel} from "../generic/WorkflowModel";
import {V1StepModel} from "./V1StepModel";
import {V1WorkflowInputParameterModel} from "./V1WorkflowInputParameterModel";
import {V1WorkflowOutputParameterModel} from "./V1WorkflowOutputParameterModel";
import {Workflow} from "../../mappings/v1.0/Workflow";
import {Serializable} from "../interfaces/Serializable";
import {RequirementBaseModel} from "../generic/RequirementBaseModel";
import {ensureArray, snakeCase, spreadAllProps, spreadSelectProps} from "../helpers/utils";
import {InputParameter} from "../../mappings/v1.0/InputParameter";
import {WorkflowOutputParameter} from "../../mappings/v1.0/WorkflowOutputParameter";
import {V1WorkflowStepInputModel} from "./V1WorkflowStepInputModel";
import {CWLVersion} from "../../mappings/v1.0/CWLVersion";
import {STEP_OUTPUT_CONNECTION_PREFIX} from "../helpers/constants";
import {Process} from "../generic/Process";
import {V1WorkflowStepOutputModel} from "./V1WorkflowStepOutputModel";
import {ProcessRequirement} from "../generic/ProcessRequirement";
import {V1ExpressionModel} from "./V1ExpressionModel";

export class V1WorkflowModel extends WorkflowModel implements Serializable<Workflow> {
    public id: string;

    public cwlVersion: CWLVersion = "v1.0";

    public steps: V1StepModel[] = [];

    public inputs: V1WorkflowInputParameterModel[] = [];

    public outputs: V1WorkflowOutputParameterModel[] = [];

    public requirements: RequirementBaseModel[] = [];

    constructor(workflow?: Workflow, loc?: string) {
        super(loc || "document");

        if (workflow) this.deserialize(workflow);
        this.graph = this.constructGraph();
    }

    public validate(): Promise<any> {
        this.cleanValidity();
        const promises = [];

        promises.concat(this.steps.map(step => step.validate()));
        promises.concat(this.inputs.map(inp => inp.validate()));
        promises.concat(this.outputs.map(out => out.validate()));

        try {
            this.graph.topSort();
        } catch (ex) {
            if (ex.message === "Graph has cycles") {
                this.setIssue({
                    [this.loc]: {
                        message: "Graph has cycles",
                        type: "error"
                    }
                });
            } else if (ex === "Can't sort unconnected graph") {
                this.setIssue({
                    [this.loc]: {
                        message: "Graph is not connected",
                        type: "warning"
                    }
                });
            }
        }

        return Promise.all(promises).then(() => this.issues);
    }

    public loc: string;
    public customProps: any = {};

    public addStepFromProcess(proc: Process): V1StepModel {
        const loc  = `${this.loc}.steps[${this.steps.length}]`;
        const step = new V1StepModel({
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

    /**
     * Adds Input, Output, or Step to workflow. Does not add them to the graph.
     */
    public addEntry(entry: V1StepModel
                        | V1WorkflowInputParameterModel
                        | V1WorkflowOutputParameterModel, type: "inputs" | "outputs" | "steps") {
        entry.loc = `${this.loc}.${type}[${this[type].length}]`;

        (this[type] as Array<any>).push(entry);

        entry.setValidationCallback((err) => this.updateValidity(err));
        return entry;
    }

    public createInputFromPort(inPort: V1WorkflowStepInputModel
                                   | string): V1WorkflowInputParameterModel {
        return super._createInputFromPort(inPort, V1WorkflowInputParameterModel);
    }

    public createOutputFromPort(outPort: V1WorkflowStepOutputModel
                                    | string): V1WorkflowOutputParameterModel {
        return super._createOutputFromPort(outPort, V1WorkflowOutputParameterModel);
    }

    public exposePort(inPort: V1WorkflowStepInputModel) {
        const port = super._exposePort(inPort, V1WorkflowInputParameterModel);
        port.customProps["sbg:exposed"] = true;
        port.isVisible = false;
    }

    protected getSourceConnectionId(source: string): string {
        if (/[\/]+/.test(source)) {
            return STEP_OUTPUT_CONNECTION_PREFIX + source;
        } else {
            return `${STEP_OUTPUT_CONNECTION_PREFIX}${source}/${source}`;
        }
    }

    /**
     * Checks if source contains stepId.
     * If it does, returns id of step.out, else null;
     * @param source
     * @param stepId
     */
    protected isSourceFromStep(source: string, stepId: string): string {
        if (/[\/]+/.test(source)) {
            const split = source.split('/');
            if (split[0] === stepId) return split[1];

            return null;
        }

        return null;
    }

    public addHint(hint?: ProcessRequirement | any): RequirementBaseModel {
        return this.createReq(hint, V1ExpressionModel, undefined,  true);
    }

    public serializeEmbedded(retainSource: boolean = false): Workflow {
        return this._serialize(true, retainSource);
    }

    serialize(): Workflow {
        return this._serialize(false);
    }

    _serialize(embed: boolean, retainSource: boolean = false): Workflow {
        const base: Workflow = <Workflow>{};

        base.class      = "Workflow";
        base.cwlVersion = "v1.0";

        if (this.sbgId || this.id) {
            base.id = this.sbgId || this.id;
        }

        if (this.description) base.doc = this.description;
        if (this.label) base.label = this.label;

        //@todo SERIALIZING HINTS AND REQUIREMENTS

        base.inputs  = <Array<InputParameter>> this.inputs.map(input => input.serialize());
        base.outputs = <Array<WorkflowOutputParameter>> this.outputs.map(output => output.serialize());
        base.steps   = this.steps.map(step => {
            if (embed) {
                return step.serializeEmbedded(retainSource);
            } else {
                return step.serialize();
            }
        });

        if (this.hints.length) { base.hints = this.hints.map((hint) => hint.serialize())}

        return spreadAllProps(base, this.customProps);
    }

    deserialize(workflow: Workflow): void {
        const serializedKeys = [
            "class",
            "id",
            "inputs",
            "outputs",
            "steps",
            "cwlVersion",
            "doc",
            "label",
            "hints"
        ];

        //@todo DESERIALIZING HINTS AND REQUIREMENTS

        this.id = this.id = workflow["sbg:id"] && workflow["sbg:id"].split("/").length > 2 ?
            workflow["sbg:id"].split("/")[2] :
            snakeCase(workflow.id);

        this.sbgId = workflow["sbg:id"];

        this.label       = workflow.label;
        this.description = workflow.doc;

        ensureArray(workflow.inputs, "id", "type").forEach((input, i) => {
            this.addEntry(new V1WorkflowInputParameterModel(input, `${this.loc}.inputs[${i}]`, this.eventHub), "inputs");
        });

        ensureArray(workflow.outputs, "id", "type").forEach((output, i) => {
            this.addEntry(new V1WorkflowOutputParameterModel(output, `${this.loc}.outputs[${i}]`, this.eventHub), "outputs");
        });

        ensureArray(workflow.steps, "id").forEach((step, i) => {
            if (step.run && typeof step.run !== "string") {
                step.run.cwlVersion = step.run.cwlVersion || "v1.0";
            }
            this.addEntry(new V1StepModel(step, `${this.loc}.steps[${i}]`, this.eventHub), "steps");
        });

        this.hints = ensureArray(workflow.hints).map((hint, i) => {
            return this.createReq(hint, V1ExpressionModel, `${this.loc}.hints[${i}]`, true);
        });

        // populates object with all custom attributes not covered in model
        spreadSelectProps(workflow, this.customProps, serializedKeys);
    }
}
