import {CommandInputParameter, CommandInputRecordField} from "../../mappings/v1.0";
import {CommandInputParameterModel} from "../generic/CommandInputParameterModel";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {Serializable} from "../interfaces/Serializable";
import {
    commaSeparatedToArray, ensureArray, isType, spreadSelectProps, isFileType
} from "../helpers/utils";
import {V1CommandLineBindingModel} from "./V1CommandLineBindingModel";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {EventHub} from "../helpers/EventHub";
import {Expression} from "../../mappings/v1.0/Expression";

export class V1CommandInputParameterModel extends CommandInputParameterModel implements Serializable<CommandInputParameter
    | CommandInputRecordField> {
    public inputBinding: V1CommandLineBindingModel;
    public secondaryFiles: V1ExpressionModel[] | any = [];
    public streamable: boolean;
    public default: any;

    public hasSecondaryFiles       = true;
    public hasSecondaryFilesInRoot = true;
    public hasStageInput           = false;

    constructor(attr: CommandInputParameter
        | CommandInputRecordField, loc?: string, eventHub?: EventHub) {
        super(loc, eventHub);
        if (attr) this.deserialize(attr);
    }

    public updateInputBinding(binding: V1CommandLineBindingModel) {
        if (binding instanceof V1CommandLineBindingModel) {
            //@todo breaks here for "serialize of undefined"
            this.inputBinding.cloneStatus(binding);
            this.inputBinding.setValidationCallback(err => this.updateValidity(err));
        }
    }

    public createInputBinding(): V1CommandLineBindingModel {
        this.inputBinding = new V1CommandLineBindingModel({}, `${this.loc}.inputBinding`, this.eventHub);
        this.inputBinding.setValidationCallback(err => this.updateValidity(err));
        return this.inputBinding;
    }

    addSecondaryFile(file: Expression | string): any {
        return this._addSecondaryFile(file, V1ExpressionModel, this.loc);
    }

    updateSecondaryFiles(files: Array<Expression | Expression | string>) {
        this._updateSecondaryFiles(files);
    }


    removeSecondaryFile(index: number) {
        this._removeSecondaryFile(index);
    }


    public serialize(): CommandInputParameter | CommandInputRecordField {
        let base: CommandInputParameter | CommandInputRecordField = {...this.customProps};

        if (this.isField) {
            (base as CommandInputRecordField).name = this.id || "";
        } else {
            (base as CommandInputParameter).id = this.id || "";
        }
        base.type = this.type.serialize("v1.0");

        if (this.inputBinding) base.inputBinding = this.inputBinding.serialize();

        if (this.label) base.label = this.label;
        if (this.description) base.doc = this.description;

        if (isFileType(this) && this.fileTypes.length) {
            (base as CommandInputParameter)["sbg:fileTypes"] = this.fileTypes.join(", ");
        }

        if (this.streamable !== undefined && !this.isField) {
            (base as CommandInputParameter).streamable = this.streamable;
        }

        if (this.secondaryFiles && this.secondaryFiles.length && !this.isField) {
            (base as CommandInputParameter).secondaryFiles = this.secondaryFiles.map(f => f.serialize()).filter(f => !!f);
        }

        if (this.default !== undefined) {
            (base as CommandInputParameter).default = this.default;
        }

        return base;
    }

    addParameter(attr) {
        this.type = new ParameterTypeModel(attr.type, V1CommandInputParameterModel, `${this.id}_field`,`${this.loc}.type`, this.eventHub);
        this.type.setValidationCallback(err => this.updateValidity(err));
    }

    addInputBinding(attr) {
        this.inputBinding = new V1CommandLineBindingModel(attr.inputBinding, `${this.loc}.inputBinding`, this.eventHub);
        this.inputBinding.setValidationCallback(err => this.updateValidity(err));
    }

    deserialize(attr: CommandInputParameter | CommandInputRecordField): void {
        const serializedKeys = ["type", "doc", "inputBinding", "label", "secondaryFiles", "sbg:fileTypes", "streamable", "default", "loadContents"];

        if ((<CommandInputRecordField> attr).name) {
            this.id      = (<CommandInputRecordField> attr).name;
            this.isField = true;
            serializedKeys.push("name");
        } else {
            this.id = (<CommandInputParameter> attr).id;
            serializedKeys.push("id");
        }

        this.addParameter(attr);

        this.type.hasDirectoryType = true;
        if (isType(this, ["record", "enum"]) && !this.type.name) {
            this.type.name = this.id;
        }

        if (attr.inputBinding) {
            this.addInputBinding(attr);
        }

        this.label          = attr.label;
        this.description    = ensureArray(attr.doc).join('\n');
        this.secondaryFiles = ensureArray((<CommandInputParameter> attr).secondaryFiles).map(f => this.addSecondaryFile(f));
        this.fileTypes      = commaSeparatedToArray(attr["sbg:fileTypes"]);
        this.streamable     = (<CommandInputParameter> attr).streamable;
        this.default        = (<CommandInputParameter> attr).default;

        this.attachFileTypeListeners();

        spreadSelectProps(attr, this.customProps, serializedKeys);
    }
}
