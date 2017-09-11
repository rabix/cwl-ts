import {WorkflowStepInputModel} from "../generic/WorkflowStepInputModel"
import {WorkflowStepInput} from "../../mappings/v1.0/WorkflowStepInput";
import {Serializable} from "../interfaces/Serializable";
import {V1StepModel} from "./V1StepModel";
import {ensureArray, spreadAllProps, spreadSelectProps} from "../helpers/utils";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {V1ExpressionModel} from "./V1ExpressionModel";

export class V1WorkflowStepInputModel extends WorkflowStepInputModel implements Serializable<WorkflowStepInput> {


    /**
     * Should in port be shown on the canvas
     */
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
        if (this.source.length) base.source = this.source.slice();

        if (this.valueFrom && this.valueFrom.serialize()) base.valueFrom = this.valueFrom.serialize();

        return spreadAllProps(base, this.customProps);
    }

    deserialize(attr: WorkflowStepInput): void {
        const serializedKeys = ["id", "default", "source", "type", "doc", "label", "format"];

        this.id      = attr.id;
        this.default = attr.default;
        this.source  = ensureArray(attr.source);

        this.valueFrom = new V1ExpressionModel(attr.valueFrom, `${this.loc}.valueFrom`);

        // properties that will not be serialized on the step.in,
        // but are necessary for internal functions
        this.type    = attr["type"];
        if (!this.type) this.type = new ParameterTypeModel(null);
        this.type.hasDirectoryType = true;

        this.description = attr["doc"];
        this.label       = attr["label"];

        this.fileTypes = attr["format"];

        spreadSelectProps(attr, this.customProps, serializedKeys);
    }
}