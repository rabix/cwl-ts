import {WorkflowModel} from "../generic/WorkflowModel";
import {V1StepModel} from "./V1StepModel";
import {V1WorkflowInputParameterModel} from "./V1WorkflowInputParameterModel";
import {V1WorkflowOutputParameterModel} from "./V1WorkflowOutputParameterModel";
import {Workflow} from "../../mappings/v1.0/Workflow";
import {Serializable} from "../interfaces/Serializable";
import {RequirementBaseModel} from "../d2sb/RequirementBaseModel";
import {Validation} from "../helpers/validation/Validation";
import {ensureArray, incrementString} from "../helpers/utils";
import {InputParameter} from "../../mappings/v1.0/InputParameter";
import {WorkflowOutputParameter} from "../../mappings/v1.0/WorkflowOutputParameter";
import {V1WorkflowStepInputModel} from "./V1WorkflowStepInputModel";

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
        this.graph = this.constructGraph();
    }

    public loc: string;
    public customProps: any = {};

    /**
     * Adds Input, Output, or Step to workflow. Does not add them to the graph.
     */
    public addEntry(entry: V1StepModel | V1WorkflowInputParameterModel | V1WorkflowOutputParameterModel, type: "inputs" | "outputs" | "steps") {
        entry.loc = `${this.loc}.${type}[${this[type].length}]`;

        (this[type] as Array<any>).push(entry);

        entry.setValidationCallback((err: Validation) => {
            this.updateValidity(err);
        });
        return entry;
    }

    /**
     * Connects two vertices which have already been added to the graph
     */
    public connect(source: string, destination: string) {
        this.graph.addEdge(source, destination);
    }

    /**
     * Expose creates an input on the workflow level and connects it with the exposed port
     * Sets inPort.isVisible to false
     * Sets input.isVisible to false
     */
    public exposePort(inPort: V1WorkflowStepInputModel) {
        // if the port has not been added to the graph yet
        if (!this.graph.hasVertex(inPort.connectionId)) {
            this.graph.addVertex(inPort.connectionId, inPort);
            this.graph.addEdge(inPort.parentStep.id, inPort.connectionId);
        }

        // create new input on the workflow to connect with the port
        const input = new V1WorkflowInputParameterModel(<InputParameter>{
            id: this.getNextAvailableId(inPort.id), // might change later in case input is already taken
            type: inPort.type ? inPort.type.serialize() : "null",
            fileTypes: inPort.fileTypes
        });

        // add a reference to the new input on the inPort
        inPort.source.push(input.id);

        // add it to the workflow tree
        input.setValidationCallback(err => this.updateValidity(err));
        this.inputs.push(input);

        // add input to graph
        this.graph.addVertex(input.connectionId, input);
        // connect input with inPort
        this.connect(input.connectionId, inPort.connectionId);
    }

    /**
     * Adds inPort to graph and makes a connection between it and its step
     * sets inPort.isVisible to true
     */
    public includePort(inPort: V1WorkflowStepInputModel) {
        inPort.isVisible = true;
        // if the port has not been added to the graph yet
        if (!this.graph.hasVertex(inPort.connectionId)) {
            this.graph.addVertex(inPort.connectionId, inPort);
            this.graph.addEdge(inPort.parentStep.id, inPort.connectionId);
        }
    }

    /**
     * Checks for naming collisions in vertex ids, in case of collisions,
     * it will increment the provided id, otherwise it returns the original id
     */
    private getNextAvailableId(id: string): string {
        let hasId = true;
        let result = id;
        while (hasId) {
            if (hasId = this.graph.hasVertex(id)) {
                result = incrementString(result);
            }
        }

        return result;
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
