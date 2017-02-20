import {WorkflowStepOutputModel} from "../generic/WorkflowStepOutputModel";
import {WorkflowStepOutput} from "../../mappings/d2sb/WorkflowStepOutput";
import {SBDraft2StepModel} from "./SBDraft2StepModel";
import {spreadSelectProps} from "../helpers/utils";
import {StepModel} from "../generic/StepModel";
import {STEP_OUTPUT_CONNECTION_PREFIX} from "../helpers/constants";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";

export class SBDraft2WorkflowStepOutputModel extends WorkflowStepOutputModel {

    private _id: string;

    public get id(): string {
        return this._id;
    }

    /**
     * ID used in graph
     */
    get connectionId(): string {
        return `${STEP_OUTPUT_CONNECTION_PREFIX}${this.parentStep.id}/${this._id}`;
    }

    /**
     * ID used for creating connections
     */
    get sourceId(): string {
        return this.id;
    }

    serialize(): WorkflowStepOutput {
        return {
            id: `${this.parentStep.id}.${this._id}`
        };
    }

    deserialize(attr: WorkflowStepOutput): void {
        const serializedKeys = ["default", "id", "sbg:fileTypes"];

        this._id         = attr.id.split(".")[1];
        this.fileTypes   = attr["sbg:fileTypes"];
        this.type        = attr["type"];
        this.description = attr["description"];
        this.label       = attr["label"];
        if (!this.type) this.type = new ParameterTypeModel(null);

        spreadSelectProps(attr, this.customProps, serializedKeys);
    }

    constructor(output?: WorkflowStepOutput, parentStep?: SBDraft2StepModel, loc?: string) {
        super(loc);

        this.parentStep = parentStep || <StepModel> {};

        if (output) this.deserialize(output);

    }
}