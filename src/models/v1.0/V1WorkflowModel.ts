import {WorkflowModel} from "../generic/WorkflowModel";
import {StepModel} from "./StepModel";
import {WorkflowInputParameterModel} from "./WorkflowInputParameterModel";
import {WorkflowOutputParameterModel} from "./WorkflowOutputParameterModel";
import {Workflow} from "../../mappings/v1.0/Workflow";
import {Serializable} from "../interfaces/Serializable";
import {RequirementBaseModel} from "../d2sb/RequirementBaseModel";
import {Validation} from "../helpers/validation/Validation";
import {checkMapValueType, ensureArray, convertToObject} from "../helpers/utils";
import {InputParameter} from "../../mappings/v1.0/InputParameter";
import {WorkflowOutputParameter} from "../../mappings/v1.0/WorkflowOutputParameter";
import {WorkflowStep} from "../../mappings/v1.0/WorkflowStep";

export class V1WorkflowModel extends WorkflowModel implements Serializable<Workflow> {
    public id: string;

    public steps: StepModel[] = [];

    public inputs: WorkflowInputParameterModel[] = [];

    public outputs: WorkflowOutputParameterModel[] = [];

    public hints: RequirementBaseModel[] = [];

    public requirements: RequirementBaseModel[] = [];

    constructor(workflow?: Workflow, loc?: string) {
        super(loc || "document");

        if (workflow) this.deserialize(workflow);
    }

    public loc: string;
    public customProps: any = {};

    public addEntry(entry: StepModel | WorkflowInputParameterModel | WorkflowOutputParameterModel, type: "inputs" | "outputs" | "steps") {
        entry.loc = `${this.loc}.${type}[${this[type].length}]`;

        (this[type] as Array<any>).push(entry);

        entry.setValidationCallback((err: Validation) => {
            this.updateValidity(err);
        });
        return entry;
    }

    serialize(): Workflow {
        const base: Workflow = <Workflow>{};

        base.class      = "Workflow";
        base.cwlVersion = "v1.0";

        base.inputs  = this.inputs.map(input => input.serialize());
        base.outputs = this.outputs.map(output => output.serialize());
        base.steps   = this.steps.map(step => step.serialize());

        return Object.assign({}, this.customProps, base);
    }

    deserialize(workflow: Workflow): void {
        const serializedAttr = [
            "class",
            "id",
            "inputs",
            "outputs",
            "hints",
            "requirements",
            "steps",
            "cwlVersion"
        ];

        this.id = workflow.id;

        ensureArray(workflow.inputs, "id", "type").forEach((input, i) => {
            this.addEntry(new WorkflowInputParameterModel(input, `${this.loc}.inputs[${i}]`), "inputs");
        });

        ensureArray(workflow.outputs, "id", "type").forEach((output, i) => {
            this.addEntry(new WorkflowOutputParameterModel(output, `${this.loc}.outputs[${i}]`), "outputs");
        });

        ensureArray(workflow.steps, "id").forEach((step, i) => {
            this.addEntry(new StepModel(step, `${this.loc}.steps[${i}]`), "steps");
        });

        // populates object with all custom attributes not covered in model
        Object.keys(workflow).forEach(key => {
            if (serializedAttr.indexOf(key) === -1) {
                this.customProps[key] = workflow[key];
            }
        });
    }
}
