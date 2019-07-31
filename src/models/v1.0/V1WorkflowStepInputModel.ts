import {WorkflowStepInput} from "../../mappings/v1.0/WorkflowStepInput";
import {LinkMerge} from "../elements/link-merge";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {WorkflowStepInputModel} from "../generic/WorkflowStepInputModel"
import {ensureArray, spreadAllProps, spreadSelectProps} from "../helpers/utils";
import {Serializable} from "../interfaces/Serializable";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {V1StepModel} from "./V1StepModel";

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

        (base.linkMerge = this.linkMerge.serialize()) || delete base.linkMerge;

        if (this.default !== undefined && this.default !== null) base.default = this.default;

        if (this.source.length) {

            if (this.source.length === 1 && !this.type.isItemOrArray && !this.type.items
                && (!this.linkMerge.value || this.linkMerge.value === "merge_nested")) {
                base.source = this.source[0];
            } else {
                base.source = this.source.slice();
            }
        }

        if (this.valueFrom && this.valueFrom.serialize()) base.valueFrom = this.valueFrom.serialize();

        base = spreadAllProps(base, this.customProps);

        delete base["sbg:toolDefaultValue"];
        delete base["sbg:category"];
        delete base["sbg:altPrefix"];

        return base;
    }

    deserialize(attr: WorkflowStepInput): void {
        const serializedKeys = [
            "id",
            "linkMerge",
            "default",
            "source",
            "type",
            "doc",
            "label",
            "fileTypes",
            "secondaryFiles"
        ];

        this.id        = attr.id;
        this.default   = attr.default;
        this.source    = ensureArray(attr.source);
        this.linkMerge = new LinkMerge(attr.linkMerge);

        this.valueFrom = new V1ExpressionModel(attr.valueFrom, `${this.loc}.valueFrom`);

        // properties that will not be serialized on the step.in,
        // but are necessary for internal functions
        this.type = attr["type"];
        if (!this.type) this.type = new ParameterTypeModel(null);
        this.type.hasDirectoryType = true;

        this.description = attr["doc"];
        this.label       = attr["label"];

        this.fileTypes = attr["fileTypes"];

        this.secondaryFiles = attr["secondaryFiles"];

        spreadSelectProps(attr, this.customProps, serializedKeys);
    }
}
