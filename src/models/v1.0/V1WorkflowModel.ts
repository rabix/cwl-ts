import {WorkflowModel} from "../generic/WorkflowModel";
import {V1StepModel} from "./V1StepModel";
import {V1WorkflowInputParameterModel} from "./V1WorkflowInputParameterModel";
import {V1WorkflowOutputParameterModel} from "./V1WorkflowOutputParameterModel";
import {Workflow} from "../../mappings/v1.0/Workflow";
import {Serializable} from "../interfaces/Serializable";
import {RequirementBaseModel} from "../d2sb/RequirementBaseModel";
import {Validation} from "../helpers/validation/Validation";
import {ensureArray} from "../helpers/utils";
import {InputParameter} from "../../mappings/v1.0/InputParameter";
import {WorkflowOutputParameter} from "../../mappings/v1.0/WorkflowOutputParameter";

export class V1WorkflowModel extends WorkflowModel implements Serializable<Workflow> {
    public id: string;

    public steps: V1StepModel[] = [];

    public inputs: V1WorkflowInputParameterModel[] = [];

    public outputs: V1WorkflowOutputParameterModel[] = [];

    public hints: RequirementBaseModel[] = [];

    public requirements: RequirementBaseModel[] = [];

    constructor(workflow?: Workflow, loc?: string) {
        super(loc || "document");

        if (workflow) this.deserialize(workflow);
    }

    public loc: string;
    public customProps: any = {};

    public addEntry(entry: V1StepModel | V1WorkflowInputParameterModel | V1WorkflowOutputParameterModel, type: "inputs" | "outputs" | "steps") {
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

        base.inputs  = <Array<InputParameter>> this.inputs.map(input => input.serialize());
        base.outputs = <Array<WorkflowOutputParameter>> this.outputs.map(output => output.serialize());
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
            this.addEntry(new V1WorkflowInputParameterModel(input, `${this.loc}.inputs[${i}]`), "inputs");
        });

        ensureArray(workflow.outputs, "id", "type").forEach((output, i) => {
            this.addEntry(new V1WorkflowOutputParameterModel(output, `${this.loc}.outputs[${i}]`), "outputs");
        });

        ensureArray(workflow.steps, "id").forEach((step, i) => {
            this.addEntry(new V1StepModel(step, `${this.loc}.steps[${i}]`), "steps");
        });

        // populates object with all custom attributes not covered in model
        Object.keys(workflow).forEach(key => {
            if (serializedAttr.indexOf(key) === -1) {
                this.customProps[key] = workflow[key];
            }
        });
    }
}
