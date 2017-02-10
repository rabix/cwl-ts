import {WorkflowModel} from "../generic/WorkflowModel";
import {Workflow} from "../../mappings/d2sb/Workflow";
import {SBDraft2StepModel} from "./SBDraft2StepModel";
import {SBDraft2WorkflowInputParameterModel} from "./SBDraft2WorkflowInputParameterModel";
import {SBDraft2WorkflowOutputParameterModel} from "./SBDraft2WorkflowOutputParameterModel";

export class SBDraft2WorkflowModel extends WorkflowModel {
    public id: string;

    public cwlVersion = "sbg:draft-2";

    public steps: SBDraft2StepModel[];

    public inputs: SBDraft2WorkflowInputParameterModel[] = [];

    public outputs: SBDraft2WorkflowOutputParameterModel[] = [];

    constructor(workflow: Workflow, loc: string) {
        super(loc);

        console.warn("sbg:draft-2 workflow isn't supported yet");
    }
}

