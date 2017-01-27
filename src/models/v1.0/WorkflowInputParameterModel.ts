import {WorkflowInputParameterModel as BaseWorkflowInputParameterModel} from "../generic/WorkflowInputParameterModel";
import {InputParameter} from "../../mappings/v1.0/InputParameter";
import {InputParameterTypeModel} from "../d2sb/InputParameterTypeModel";

export class WorkflowInputParameterModel extends BaseWorkflowInputParameterModel {

    constructor(input?, loc?: string) {
        super(loc);
        if (input) this.deserialize(input);
    }

    deserialize(attr: InputParameter) {
        this.id = attr.id;
        this.type = new InputParameterTypeModel(attr.type, `${this.loc}.type`);
    }

    serialize(): InputParameter{
        return {
            id: this.id,
            type: this.type.serialize()
        }
    }
}