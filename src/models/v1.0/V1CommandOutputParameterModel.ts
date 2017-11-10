import {CommandOutputParameter} from "../../mappings/v1.0";
import {CommandOutputParameterModel} from "../generic/CommandOutputParameterModel";
import {Serializable} from "../interfaces/Serializable";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {
    commaSeparatedToArray, ensureArray, isType, spreadAllProps,
    spreadSelectProps
} from "../helpers/utils";
import {V1CommandOutputBindingModel} from "./V1CommandOutputBindingModel";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {CommandOutputRecordField} from "../../mappings/v1.0/CommandOutputRecordField";
import {Expression} from "../../mappings/v1.0/Expression";
import {EventHub} from "../helpers/EventHub";

export class V1CommandOutputParameterModel extends CommandOutputParameterModel implements Serializable<CommandOutputParameter> {
    public label: string;
    public outputBinding: V1CommandOutputBindingModel;
    public description: string;
    public secondaryFiles: V1ExpressionModel[] = [];
    public streamable: boolean;
    public id: string;

    public hasSecondaryFiles = true;

    constructor(output: CommandOutputParameter | CommandOutputRecordField, loc?: string, eventHub?: EventHub) {
        super(loc, eventHub);

        if (output) this.deserialize(output);
    }

    customProps: any = {};

    addSecondaryFile(file: string = ""): V1ExpressionModel {
        return this._addSecondaryFile(file, V1ExpressionModel, this.loc);
    }

    updateSecondaryFiles(files: Array<Expression | string>) {
        this._updateSecondaryFiles(files);
    }

    removeSecondaryFile(index: number) {
        this._removeSecondaryFile(index);
    }

    serialize(): CommandOutputParameter {
        let base: CommandOutputParameter | CommandOutputRecordField = <any> {};

        !this.isField ? (<CommandOutputParameter> base).id = this.id : (<CommandOutputRecordField> base).name = this.id;

        if (this.description) base.doc = this.description;
        if (this.label) base.label = this.label;

        base.type = this.type.serialize("v1.0");

        if (this.outputBinding) {
            base.outputBinding = this.outputBinding.serialize();
        }

        if (!this.isField && this.secondaryFiles.length && (this.type.type === "File" || this.type.items === "File")) {
            (<CommandOutputParameter> base).secondaryFiles = this.secondaryFiles.map(f => f.serialize()).filter(f => !!f);
        }

        if (!this.isField && this.fileTypes.length) {
            (<CommandOutputParameter> base)["sbg:fileTypes"] = this.fileTypes.join(", ");
        }

        if (!this.isField && this.streamable) {
            (<CommandOutputParameter> base).streamable = this.streamable;
        }

        return spreadAllProps(base, this.customProps);
    }

    deserialize(attr: CommandOutputParameter | CommandOutputRecordField): void {
        const serializedKeys = ["id", "type", "outputBinding", "label", "doc", "secondaryFiles", "sbg:fileTypes", "streamable"];

        this.isField = !!(<CommandOutputRecordField> attr).name; // record fields don't have ids

        this.id = (<CommandOutputParameter> attr).id || (<CommandOutputRecordField> attr).name;

        this.type = new ParameterTypeModel(attr.type, V1CommandOutputParameterModel, `${this.id}_field`,`${this.loc}.type`, this.eventHub);
        this.type.setValidationCallback(err => this.updateValidity(err));
        this.type.hasDirectoryType = true;

        if (isType(this, ["record", "enum"]) && !this.type.name) {
            this.type.name = this.id;
        }

        this.outputBinding = new V1CommandOutputBindingModel(attr.outputBinding, `${this.loc}.outputBinding`, this.eventHub);
        this.outputBinding.setValidationCallback(err => this.updateValidity(err));

        this.label       = attr.label;
        this.description = ensureArray(attr.doc).join("\n\n");

        // properties only on inputs, not on fields
        this.secondaryFiles = ensureArray((<CommandOutputParameter> attr).secondaryFiles).map(f => this.addSecondaryFile(f));
        this.fileTypes      = commaSeparatedToArray((<CommandOutputParameter> attr)["sbg:fileTypes"]);
        this.streamable     = (<CommandOutputParameter> attr).streamable;

        this.attachFileTypeListeners();

        spreadSelectProps(attr, this.customProps, serializedKeys);
    }
}