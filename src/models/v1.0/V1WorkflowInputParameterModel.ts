import {WorkflowInputParameterModel} from "../generic/WorkflowInputParameterModel";
import {InputParameter} from "../../mappings/v1.0/InputParameter";
import {V1InputParameterTypeModel} from "./V1InputParameterTypeModel";
import {RecordField} from "../../mappings/v1.0/RecordField";

export class V1WorkflowInputParameterModel extends WorkflowInputParameterModel {

    constructor(input?: InputParameter | RecordField, loc?: string) {
        super(loc);
        if (input) this.deserialize(input);
    }

    deserialize(attr: InputParameter | RecordField) {
        this.id = (<InputParameter> attr).id || (<RecordField> attr).name;
        this.type = new V1InputParameterTypeModel(attr.type, `${this.loc}.type`);
    }

    serialize(): InputParameter | RecordField{
        return {
            id: this.id,
            type: this.type.serialize()
        }
    }
}