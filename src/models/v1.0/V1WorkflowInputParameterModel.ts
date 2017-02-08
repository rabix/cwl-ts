import {WorkflowInputParameterModel} from "../generic/WorkflowInputParameterModel";
import {InputParameter} from "../../mappings/v1.0/InputParameter";
import {RecordField} from "../../mappings/v1.0/RecordField";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";

export class V1WorkflowInputParameterModel extends WorkflowInputParameterModel {

    constructor(input?: InputParameter | RecordField, loc?: string) {
        super(loc);
        if (input) this.deserialize(input);
    }

    deserialize(attr: InputParameter | RecordField) {
        this.id = (<InputParameter> attr).id || (<RecordField> attr).name;
        this.type = new ParameterTypeModel(attr.type, V1WorkflowInputParameterModel, `${this.loc}.type`);
    }

    serialize(): InputParameter | RecordField{
        return {
            id: this.id,
            type: this.type.serialize()
        }
    }
}