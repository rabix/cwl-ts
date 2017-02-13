import {WorkflowStepInputModel} from "../generic/WorkflowStepInputModel";
import {WorkflowStepInput} from "../../mappings/d2sb/WorkflowStepInput";
import {SBDraft2StepModel} from "./SBDraft2StepModel";
import {spreadSelectProps} from "../helpers/utils";

export class SBDraft2WorkflowStepInputModel extends WorkflowStepInputModel {

    serialize(): WorkflowStepInput {
        return super.serialize();
    }

    deserialize(attr: WorkflowStepInput): void {
        const serializedKeys = ["default", "id", "sbg:fileTypes"];

        this.default   = attr.default;
        this.id        = attr.id;
        this.fileTypes = attr["sbg:fileTypes"];

        spreadSelectProps(attr, this.customProps, serializedKeys);
    }

    constructor(input?: WorkflowStepInput, parentStep?: SBDraft2StepModel, loc?: string) {
        super(loc);

        this.parentStep = parentStep;

        if (input) this.deserialize(input);
    }
}
