import {WorkflowInputParameterModel} from "../generic/WorkflowInputParameterModel";
import {InputParameter} from "../../mappings/v1.0/InputParameter";
import {RecordField} from "../../mappings/v1.0/RecordField";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {
    commaSeparatedToArray,
    ensureArray,
    spreadAllProps,
    spreadSelectProps
} from "../helpers/utils";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {V1CommandLineBindingModel} from "./V1CommandLineBindingModel";

export class V1WorkflowInputParameterModel extends WorkflowInputParameterModel {
    public secondaryFiles?: Array<V1ExpressionModel>;
    public streamable?: boolean;
    public inputBinding?: V1CommandLineBindingModel;

    constructor(input?: InputParameter | RecordField, loc?: string) {
        super(loc);
        if (input) this.deserialize(input);
    }

    deserialize(attr: InputParameter | RecordField) {
        const serializedKeys = ["id", "name", "type", "label", "doc"];

        // @todo serialization of secondaryFiles, streamable, inputBinding

        this.label = attr.label;
        this.description = ensureArray(attr.doc).join("\n\n");

        this.id = (<InputParameter> attr).id || (<RecordField> attr).name;
        this.isField = !!(<RecordField> attr).name;
        this.type = new ParameterTypeModel(attr.type, V1WorkflowInputParameterModel, `${this.loc}.type`);
        this.type.setValidationCallback(err => this.updateValidity(err));

        this.fileTypes = commaSeparatedToArray((attr as InputParameter).format);

        spreadSelectProps(attr, this.customProps, serializedKeys);
    }

    serialize(): InputParameter | RecordField {
        const base: InputParameter | RecordField = <InputParameter | RecordField> {};

        if (this.isField) {
            (base as RecordField).name = this.id;
        } else {
            (base as InputParameter).id = this.id;
            if (this.fileTypes.length) (base as InputParameter).format = this.fileTypes;
        }

        if (this.type.type) base.type = this.type.serialize("v1.0");

        if (this.label) base.label = this.label;
        if (this.description) base.doc = this.description;

        return spreadAllProps(base, this.customProps);
    }
}