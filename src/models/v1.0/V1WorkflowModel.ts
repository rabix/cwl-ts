import {CWLVersion} from "../../mappings/v1.0/CWLVersion";
import {InputParameter} from "../../mappings/v1.0/InputParameter";
import {Workflow} from "../../mappings/v1.0/Workflow";
import {WorkflowOutputParameter} from "../../mappings/v1.0/WorkflowOutputParameter";
import {NamespaceBag} from "../elements/namespace-bag";
import {Process} from "../generic/Process";
import {ProcessRequirement} from "../generic/ProcessRequirement";
import {RequirementBaseModel} from "../generic/RequirementBaseModel";
import {WorkflowModel} from "../generic/WorkflowModel";
import {STEP_OUTPUT_CONNECTION_PREFIX} from "../helpers/constants";
import {ensureArray, snakeCase, spreadAllProps, spreadSelectProps} from "../helpers/utils";
import {Customizable} from '../interfaces/Customizable';
import {Serializable} from "../interfaces/Serializable";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {V1StepModel} from "./V1StepModel";
import {V1WorkflowInputParameterModel} from "./V1WorkflowInputParameterModel";
import {V1WorkflowOutputParameterModel} from "./V1WorkflowOutputParameterModel";
import {V1WorkflowStepInputModel} from "./V1WorkflowStepInputModel";
import {V1WorkflowStepOutputModel} from "./V1WorkflowStepOutputModel";

export class V1WorkflowModel extends WorkflowModel implements Serializable<Workflow> {
    id: string;

    cwlVersion: CWLVersion = "v1.0";

    steps: V1StepModel[] = [];

    inputs: V1WorkflowInputParameterModel[] = [];

    outputs: V1WorkflowOutputParameterModel[] = [];

    requirements: RequirementBaseModel[] = [];

    constructor(workflow?: Workflow, loc?: string) {
        super(loc || "document");

        this.initializeExprWatchers();

        if (workflow) {
            this.deserialize(workflow);
        }

        this.constructed = true;

        this.graph = this.constructGraph();
        this.validateAllExpressions();
        this.validateGraph();
    }

    loc: string;
    customProps: any = {};

    addStepFromProcess(proc: Process): V1StepModel {
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
    addEntry(entry: V1StepModel
                        | V1WorkflowInputParameterModel
                        | V1WorkflowOutputParameterModel, type: "inputs" | "outputs" | "steps") {
        entry.loc = `${this.loc}.${type}[${this[type].length}]`;

        (this[type] as Array<any>).push(entry);

        entry.setValidationCallback((err) => this.updateValidity(err));
        return entry;
    }

    createInputFromPort(inPort: V1WorkflowStepInputModel | string,
                               data: Customizable = {}): V1WorkflowInputParameterModel {

        return super._createInputFromPort(inPort, V1WorkflowInputParameterModel, undefined, undefined, data);
    }

    createOutputFromPort(outPort: V1WorkflowStepOutputModel
                                    | string, data: Customizable = {}): V1WorkflowOutputParameterModel {

        return super._createOutputFromPort(outPort, V1WorkflowOutputParameterModel, undefined, undefined, data);
    }

    exposePort(inPort: V1WorkflowStepInputModel) {
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

    addHint(hint?: ProcessRequirement | any): RequirementBaseModel {
        return this.createReq(hint, V1ExpressionModel, undefined,  true);
    }

    serializeEmbedded(retainSource: boolean = false): Workflow {
        return this._serialize(true, retainSource);
    }

    serialize(): Workflow {
        return this._serialize(false);
    }

    _serialize(embed: boolean, retainSource: boolean = false): Workflow {
        let base: Workflow = <Workflow>{};

        base.class      = "Workflow";
        base.cwlVersion = "v1.0";

        if (this.sbgId || this.id) {
            base.id = this.sbgId || this.id;
        }

        if (this.description) base.doc = this.description;
        if (this.label) base.label = this.label;

        if (this.namespaces.isNotEmpty()) {
            base.$namespaces = this.namespaces.serialize();
        }

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

        // adding the proper requirements based on the features of the workflow
        let requirements    = ensureArray(this.customProps.requirements, "class", "value") || [];
        let allStepsHaveRun = true;

        let reqMap = {
            SubworkflowFeatureRequirement: false,
            ScatterFeatureRequirement: false,
            MultipleInputFeatureRequirement: false
        };

        // feature detection
        for (let i = 0; i < this.steps.length; i++) {
            const step = this.steps[i];

            if (step.run && step.run instanceof WorkflowModel) {
                reqMap.SubworkflowFeatureRequirement = true;
            } else if (!step.run) {
                allStepsHaveRun = false;
            }

            if (step.scatter.length) {
                reqMap.ScatterFeatureRequirement = true;
            }

            for (let j = 0; j < step.in.length; j++) {
                const inPort = step.in[j];
                if (inPort.source && inPort.source.length > 1) {
                    reqMap.MultipleInputFeatureRequirement = true;
                }
            }
        }

        // requirement setting
        for (let req in reqMap) {
            // only remove SubworkflowFeatureRequirement if we know the run type of all steps
            if (allStepsHaveRun || req !== "SubworkflowFeatureRequirement") {
                // remove each requirement first
                requirements = requirements.filter(r => r.class !== req);
            }

            // re-add it only if it's needed
            if (reqMap[req]) {
                requirements.push({
                    class: req
                });
            }
        }

        base.requirements = requirements;

        delete this.customProps.requirements;

        return spreadAllProps(base, this.customProps);
    }

    deserialize(workflow: Workflow): void {
        const serializedKeys = [
            "class",
            "$namespaces",
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
        this.namespaces  = new NamespaceBag(workflow.$namespaces);

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
