import {WorkflowStepInput} from "../../mappings/d2sb/WorkflowStepInput";
import {LinkMerge} from "../elements/link-merge";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {StepModel} from "../generic/StepModel";
import {WorkflowStepInputModel} from "../generic/WorkflowStepInputModel";
import {STEP_INPUT_CONNECTION_PREFIX} from "../helpers/constants";
import {ensureArray, spreadAllProps, spreadSelectProps} from "../helpers/utils";
import {SBDraft2StepModel} from "./SBDraft2StepModel";

export class SBDraft2WorkflowStepInputModel extends WorkflowStepInputModel {
    private _id: string;

    public get id(): string {
        return this._id;
    }

    /**
     * The connectionId used within the graph, prefix with "in/" because it refers to the
     */
    get connectionId(): string {
        return `${STEP_INPUT_CONNECTION_PREFIX}${this.parentStep.id}/${this._id}`;
    }

    /**
     * ID used for scatter
     * @returns {string}
     */
    get destinationId(): string {
        return `#${this.parentStep.id}.${this._id}`;
    }

    serialize(): WorkflowStepInput {
        let base: WorkflowStepInput = <WorkflowStepInput>{};

        base.id = `#${this.parentStep.id}.${this._id}`;
        if (this.default !== undefined && this.default !== null) base.default = this.default;

        if (this.source.length) {

            if (this.source.length === 1 && !this.type.isItemOrArray && !this.type.items
                && (!this.linkMerge.value || this.linkMerge.value === "merge_nested")) {
                base.source = this.source[0];
            } else {
                base.source = this.source.slice();
            }
        }

        (base.linkMerge = this.linkMerge.serialize()) || delete base.linkMerge;

        base = spreadAllProps(base, this.customProps);

        delete base["sbg:toolDefaultValue"];
        delete base["sbg:category"];
        delete base["sbg:altPrefix"];

        return base;
    }

    deserialize(attr: WorkflowStepInput): void {
        const serializedKeys = [
            "default",
            "id",
            "fileTypes",
            "type",
            "description",
            "label",
            "source",
            "linkMerge"
        ];

        this.default     = attr.default;
        this._id         = attr.id.split(".")[1];

        // properties that will not be serialized on the step.in,
        // but are necessary for internal functions
        this.fileTypes   = attr["fileTypes"];
        this.description = attr["description"];
        this.label       = attr["label"];
        this.source      = ensureArray(attr.source);
        this.linkMerge   = new LinkMerge(attr.linkMerge);

        this.type = attr["type"];
        if (!this.type) this.type = new ParameterTypeModel(null);
        this.type.hasMapType = true;

        spreadSelectProps(attr, this.customProps, serializedKeys);
    }

    constructor(input?: WorkflowStepInput, parentStep?: SBDraft2StepModel, loc?: string) {
        super(loc);

        this.parentStep = parentStep || <StepModel> {};

        if (input) this.deserialize(input);
    }
}
