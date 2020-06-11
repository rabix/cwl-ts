import {V1WorkflowModel} from "../v1.0/V1WorkflowModel";

import {V1_1WorkflowInputParameterModel} from "./V1_1WorkflowInputParameterModel";
import {V1_1WorkflowOutputParameterModel} from "./V1_1WorkflowOutputParameterModel";
import {CWLVersion, Workflow} from "../../mappings/v1.0";
import {V1_1StepModel} from "./V1_1StepModel";
import {V1WorkflowStepInputModel} from "../v1.0/V1WorkflowStepInputModel";
import {Customizable} from "../interfaces/Customizable";
import {V1WorkflowInputParameterModel, V1WorkflowOutputParameterModel} from "../v1.0";
import {V1WorkflowStepOutputModel} from "../v1.0/V1WorkflowStepOutputModel";

export class V1_1WorkflowModel extends V1WorkflowModel {

    cwlVersion: CWLVersion = "v1.1";

    inputs: V1_1WorkflowInputParameterModel[];

    outputs: V1_1WorkflowOutputParameterModel[];

    steps: V1_1StepModel[];

    constructor(workflow?: Workflow, loc?: string) {
        super(workflow, loc);
    }

    createInputFromPort(inPort: V1WorkflowStepInputModel | string,
                        data: Customizable = {}): V1WorkflowInputParameterModel {

        return super._createInputFromPort(inPort, V1_1WorkflowInputParameterModel, undefined, undefined, data);
    }

    createOutputFromPort(outPort: V1WorkflowStepOutputModel
        | string, data: Customizable = {}): V1WorkflowOutputParameterModel {

        return super._createOutputFromPort(outPort, V1_1WorkflowOutputParameterModel, undefined, undefined, data);
    }

    addInput(input, index) {
        this.addEntry(new V1_1WorkflowInputParameterModel(input, `${this.loc}.inputs[${index}]`, this.eventHub), "inputs");
    }

    addOutput(output, index) {
        this.addEntry(new V1_1WorkflowOutputParameterModel(output, `${this.loc}.outputs[${index}]`, this.eventHub), "outputs");
    }

    addStep(step, index) {
        if (step.run && typeof step.run !== "string") {
            step.run.cwlVersion = step.run.cwlVersion || "v1.1";
        }
        this.addEntry(new V1_1StepModel(step, `${this.loc}.steps[${index}]`, this.eventHub), "steps");
    }

    serializeEmbedded(retainSource: boolean = false): Workflow {
       return super.serializeEmbedded(retainSource);
    }

    serialize(): Workflow {
        return this._serialize(false);
    }

    _serialize(embed: boolean, retainSource: boolean = false): Workflow {

        const base = super._serialize(embed, retainSource);

        base.cwlVersion = "v1.1";

        const hasPortDirectory = [...this.inputs, ...this.outputs]
            .find((port) => {
            return (port.type && port.type.type === 'Directory');
        });

        if (hasPortDirectory) {
            base.requirements = base.requirements || [];

            if (!base.requirements.find(req => req.class === 'LoadListingRequirement')) {
                base.requirements.push({
                    "class": "LoadListingRequirement"
                });
            }

        }

        return base;
    }

    deserialize(workflow: Workflow): void {
        super.deserialize(workflow);
    }

}
