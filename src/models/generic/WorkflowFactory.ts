import {V1_2WorkflowModel} from "../v1.2/V1_2WorkflowModel";
import {WorkflowModel} from "./WorkflowModel";
import {V1WorkflowModel} from "../v1.0/V1WorkflowModel";

import {Workflow as V1Workflow} from "../../mappings/v1.0/Workflow";
import {Workflow as SBDraft2Workflow} from "../../mappings/d2sb/Workflow";
import {SBDraft2WorkflowModel} from "../d2sb/SBDraft2WorkflowModel";
import {Process} from "../../mappings/v1.0/Process";
import {V1_1WorkflowModel} from "../v1.1/V1_1WorkflowModel";

export class WorkflowFactory {
    public static from(workflow?: V1Workflow | SBDraft2Workflow | Process, loc?: string): WorkflowModel {
        // check if workflow passed has already been parsed to the model
        if (workflow instanceof WorkflowModel) return workflow;

        if (workflow) {
            switch (workflow.cwlVersion) {
                case "v1.2":
                    return new V1_2WorkflowModel(workflow as V1Workflow, loc);
                case "v1.1":
                    return new V1_1WorkflowModel(workflow as V1Workflow, loc);
                case "v1.0":
                    return new V1WorkflowModel(workflow as V1Workflow, loc);
                case "sbg:draft-2":
                case "draft-2":
                default:
                return new SBDraft2WorkflowModel(workflow as SBDraft2Workflow, loc);
                // default:
                //     //@todo should default to draft-2 because that was the last draft that didn't require cwlVersion
                //     console.warn("Unsupported CWL version", workflow.cwlVersion);
            }
        }

        return new SBDraft2WorkflowModel(workflow as SBDraft2Workflow, loc);
    }
}
