import {WorkflowInputParameterModel} from "../generic/WorkflowInputParameterModel";
import {InputParameter} from "../../mappings/v1.0/InputParameter";
import {RecordField} from "../../mappings/v1.0/RecordField";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {commaSeparatedToArray, spreadAllProps, spreadSelectProps} from "../helpers/utils";

export class V1WorkflowInputParameterModel extends WorkflowInputParameterModel {

    constructor(input?: InputParameter | RecordField, loc?: string) {
        super(loc);
        if (input) this.deserialize(input);
    }

    deserialize(attr: InputParameter | RecordField) {
        const serializedKeys = ["id", "name", "type"];

        this.id = (<InputParameter> attr).id || (<RecordField> attr).name;
        this.isField = !!(<RecordField> attr).name;
        this.type = new ParameterTypeModel(attr.type, V1WorkflowInputParameterModel, `${this.loc}.type`);
        this.fileTypes = commaSeparatedToArray(attr["format"]);

        spreadSelectProps(attr, this.customProps, serializedKeys);
    }

    serialize(): InputParameter | RecordField{
        const base: any = {};
        base.type = this.type.serialize();
        if (this.isField) {
            base.name = this.id;
        } else {
            base.id = this.id;
        }

        return spreadAllProps(base, this.customProps);
    }
}