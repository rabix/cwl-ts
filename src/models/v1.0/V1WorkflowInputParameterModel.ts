import {WorkflowInputParameterModel} from "../generic/WorkflowInputParameterModel";
import {InputParameter} from "../../mappings/v1.0/InputParameter";
import {V1InputParameterTypeModel} from "./V1InputParameterTypeModel";

export class V1WorkflowInputParameterModel extends WorkflowInputParameterModel {

    constructor(input?, loc?: string) {
        super(loc);
        if (input) this.deserialize(input);
    }

    deserialize(attr: InputParameter) {
        this.id = attr.id;
        this.type = new V1InputParameterTypeModel(attr.type, `${this.loc}.type`);
    }

    serialize(): InputParameter{
        return {
            id: this.id,
            type: this.type.serialize()
        }
    }
}