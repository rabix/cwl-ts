import {WorkflowStepOutputModel} from "../generic/WorkflowStepOutputModel";
import {WorkflowStepOutput} from "../../mappings/v1.0/WorkflowStepOutput";
import {Serializable} from "../interfaces/Serializable";
import {V1StepModel} from "./V1StepModel";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";

export class V1WorkflowStepOutputModel extends WorkflowStepOutputModel implements Serializable<WorkflowStepOutput>{
    constructor(output?, step?: V1StepModel, loc?: string) {
        super(loc);
        this.parentStep = step;
        if (output) this.deserialize(output);
    }

    customProps: any;
    doc: string | string[];

    serialize(): WorkflowStepOutput {
        return {
            id: this.id
        }
    }

    get sourceId () {
        return `${this.parentStep.id}/${this.id}`
    }

    deserialize(output: WorkflowStepOutput): void {
        this.id = output.id;

        // properties that will not be serialized on the step.out,
        // but are necessary for internal functions
        this.type = output["type"];
        if (!this.type) this.type = new ParameterTypeModel(null);
        this.type.hasDirectoryType = true;

        this.doc = output["doc"];
        this.label = output["label"];
        this.secondaryFiles = output["secondaryFiles"];

        this.fileTypes = output["format"];
    }
}
