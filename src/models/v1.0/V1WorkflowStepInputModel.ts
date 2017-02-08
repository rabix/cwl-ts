import {WorkflowStepInputModel} from "../generic/WorkflowStepInputModel"
import {WorkflowStepInput} from "../../mappings/v1.0/WorkflowStepInput";
import {Serializable} from "../interfaces/Serializable";
import {V1StepModel} from "./V1StepModel";
import {ensureArray} from "../helpers/utils";

export class V1WorkflowStepInputModel extends WorkflowStepInputModel implements Serializable<WorkflowStepInput> {

    get isExposed() {
        return !!this.source.length && !this.isVisible;
    }

    get isInPorts() {
        return this.isVisible;
    }

    isVisible = false;

    constructor(stepInput?: WorkflowStepInput, step?: V1StepModel, loc?: string) {
        super(loc);
        this.parentStep = step;

        if (stepInput) this.deserialize(stepInput);
    }

    serialize(): WorkflowStepInput {
        let base: WorkflowStepInput = {
            id: this.id
        };

        if (this.default) base.default = this.default;
        if (this.source) base.source = this.source;

        return base;
    }

    deserialize(attr: WorkflowStepInput): void {
        this.id        = attr.id;
        this.default   = attr.default;
        this.source    = ensureArray(attr.source);
        this.type      = attr["type"];
        this.fileTypes = attr["fileTypes"];
    }
}