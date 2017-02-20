import {WorkflowStepInputModel} from "../generic/WorkflowStepInputModel";
import {WorkflowStepInput} from "../../mappings/d2sb/WorkflowStepInput";
import {SBDraft2StepModel} from "./SBDraft2StepModel";
import {ensureArray, spreadSelectProps} from "../helpers/utils";
import {StepModel} from "../generic/StepModel";
import {STEP_INPUT_CONNECTION_PREFIX} from "../helpers/constants";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";

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

    serialize(): WorkflowStepInput {
        return {
            id:  `${this.parentStep.id}.${this._id}`,
            source: this.source,
            linkMerge: this.linkMerge,
            default: this.default
        };
    }

    deserialize(attr: WorkflowStepInput): void {
        const serializedKeys = ["default", "id", "sbg:fileTypes"];

        this.default     = attr.default;
        this._id         = attr.id.split(".")[1];
        this.fileTypes   = attr["sbg:fileTypes"];
        this.description = attr["description"];
        this.label       = attr["label"];
        this.source      = ensureArray(attr.source);

        this.type = attr["type"];
        if (!this.type) this.type = new ParameterTypeModel(null);

        spreadSelectProps(attr, this.customProps, serializedKeys);
    }

    constructor(input?: WorkflowStepInput, parentStep?: SBDraft2StepModel, loc?: string) {
        super(loc);

        this.parentStep = parentStep || <StepModel> {};

        if (input) this.deserialize(input);
    }
}
