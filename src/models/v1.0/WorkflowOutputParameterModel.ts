import {WorkflowOutputParameterModel as BaseWorkflowOutputParameterModel} from "../generic/WorkflowOutputParameterModel";

export class WorkflowOutputParameterModel extends BaseWorkflowOutputParameterModel {

    constructor(output?, loc?: string) {
        super(loc);
    }
}