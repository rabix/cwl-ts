import {WorkflowStepOutputModel} from "../generic/WorkflowStepOutputModel";
import {WorkflowStepOutput} from "../../mappings/d2sb/WorkflowStepOutput";
import {SBDraft2StepModel} from "./SBDraft2StepModel";

export class SBDraft2WorkflowStepOutputModel extends WorkflowStepOutputModel {

    constructor(output?: WorkflowStepOutput, parentStep?: SBDraft2StepModel, loc?: string) {
        super(loc);

    }
}