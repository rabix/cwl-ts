import {InputParameter} from "../../mappings/v1.0/InputParameter";
import {RecordField} from "../../mappings/v1.0/RecordField";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {
    commaSeparatedToArray,
    ensureArray,
    spreadAllProps,
    spreadSelectProps,
    isFileType
} from "../helpers/utils";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {V1CommandLineBindingModel} from "./V1CommandLineBindingModel";
import {EventHub} from "../helpers/EventHub";
import {Expression} from "../../mappings/v1.0";
import {ExpressionModel} from "../generic/ExpressionModel";
import {WorkflowInputParameterModel} from "../generic/WorkflowInputParameterModel";

export class V1WorkflowInputParameterModel extends WorkflowInputParameterModel {
    public streamable?: boolean;
    public inputBinding?: V1CommandLineBindingModel;
    public doc?: string;

    constructor(input?: InputParameter | RecordField, loc?: string, eventHub?: EventHub) {
        super(loc, eventHub);
        if (input) this.deserialize(input);
    }

    addParameter(attr: InputParameter | RecordField): void {

        this.type = new ParameterTypeModel(
            attr.type,
            V1WorkflowInputParameterModel,
            `${this.id}_field`,
            `${this.loc}.type`,
            this.eventHub);

        this.type.setValidationCallback(err => this.updateValidity(err));
    }

    deserialize(attr: InputParameter | RecordField) {
        const serializedKeys = ["id", "name", "type", "label", "doc", "sbg:fileTypes", "secondaryFiles"];

        // @todo serialization of streamable, inputBinding

        this._label      = attr.label;
        this.description = ensureArray(attr.doc).join("\n");
        this.doc         = this.description;

        this.id = (<InputParameter>attr).id || (<RecordField>attr).name;
        this.isField = !!(<RecordField>attr).name;

        this.addParameter(attr);

        this.type.hasDirectoryType = true;

        this.fileTypes = commaSeparatedToArray(attr["sbg:fileTypes"]);

        this.isVisible = !attr["sbg:exposed"];

        this.secondaryFiles = ensureArray((<InputParameter> attr).secondaryFiles).map(f => this.addSecondaryFile(f));

        this.attachFileTypeListeners();

        spreadSelectProps(attr, this.customProps, serializedKeys);
    }

    addSecondaryFile(file: Expression | string): ExpressionModel {
        return this._addSecondaryFile(file, V1ExpressionModel, `${this.loc}`);
    }

    updateSecondaryFiles(files: Array<Expression | string>) {
        this._updateSecondaryFiles(files);

    }

    removeSecondaryFile(index: number) {
        this._removeSecondaryFile(index);
    }

    serialize(): InputParameter | RecordField {
        const base: InputParameter | RecordField = <InputParameter | RecordField> {};

        if (this.isField) {
            (base as RecordField).name = this.id;
        } else {
            (base as InputParameter).id = this.id;
            if (isFileType(this) && this.fileTypes.length) {
                (base as InputParameter)["sbg:fileTypes"] = this.fileTypes.join(", ");
            }
        }

        if (this.type.type) base.type = this.type.serialize("v1.0");

        if (this._label) base.label = this._label;
        if (this.description) base.doc = this.description;

        if (this.secondaryFiles && this.secondaryFiles.length) {
            (base as InputParameter).secondaryFiles = this.secondaryFiles.map(f => f.serialize()).filter(f => !!f);
        }

        return spreadAllProps(base, this.customProps);
    }
}
