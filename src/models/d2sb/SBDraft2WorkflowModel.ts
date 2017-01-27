import {WorkflowModel} from "../generic/WorkflowModel";
import {Workflow} from "../../mappings/d2sb/Workflow";
import {StepModel} from "../generic/StepModel";
import {WorkflowInputParameterModel} from "../generic/WorkflowInputParameterModel";
import {WorkflowOutputParameterModel} from "../generic/WorkflowOutputParameterModel";

export class SBDraft2WorkflowModel extends WorkflowModel {
    public steps: StepModel[];

    public inputs: WorkflowInputParameterModel[] = [];

    public outputs: WorkflowOutputParameterModel[] = [];

    constructor(workflow: Workflow, loc: string) {
        super(loc);

        console.warn("sbg:draft-2 workflow isn't supported yet");
    }
}

