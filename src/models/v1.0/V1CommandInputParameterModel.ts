import {CommandInputParameter, CommandInputRecordField} from "../../mappings/v1.0";
import {CommandInputParameterModel} from "../generic/CommandInputParameterModel";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {Serializable} from "../interfaces/Serializable";
import {commaSeparatedToArray, ensureArray, spreadSelectProps} from "../helpers/utils";
import {V1CommandLineBindingModel} from "./V1CommandLineBindingModel";
import {CommandLineBinding} from "../../mappings/v1.0/CommandLineBinding";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {EventHub} from "../helpers/EventHub";

export class V1CommandInputParameterModel extends CommandInputParameterModel implements Serializable<
    CommandInputParameter
    | CommandInputRecordField> {
    public inputBinding: V1CommandLineBindingModel;
    public secondaryFiles: V1ExpressionModel[];
    public streamable: boolean;

    public hasSecondaryFiles = true;
    public hasStageInput     = false;

    constructor(attr:
                    CommandInputParameter
                    | CommandInputRecordField, loc?: string, eventHub?: EventHub) {
        super(loc, eventHub);
        if (attr) this.deserialize(attr);
    }

    public updateInputBinding(binding: V1CommandLineBindingModel | CommandLineBinding) {
        if (binding instanceof V1CommandLineBindingModel) {
            binding = (binding as V1CommandLineBindingModel).serialize();
        }

        this.inputBinding = new V1CommandLineBindingModel(<CommandLineBinding> binding, `${this.loc}.inputBinding`);
        this.inputBinding.setValidationCallback(err => this.updateValidity(err));
    }

    public createInputBinding(): V1CommandLineBindingModel {
        this.inputBinding = new V1CommandLineBindingModel({}, `${this.loc}.inputBinding`);
        this.inputBinding.setValidationCallback(err => this.updateValidity(err));
        return this.inputBinding;
    }

    public serialize(): CommandInputParameter | CommandInputRecordField {
        let base: CommandInputParameter | CommandInputRecordField = {...this.customProps};

        base.type = this.type.serialize("v1.0");
        if (this.isField) {
            (base as CommandInputRecordField).name = this.id;
        } else {
            (base as CommandInputParameter).id = this.id;
        }

        if (this.inputBinding) base.inputBinding = this.inputBinding.serialize();

        if (this.label) base.label = this.label;
        if (this.description.length) base.doc = this.description;

        if (this.fileTypes.length && !this.isField) {
            (base as CommandInputParameter).format = this.fileTypes;
        }

        if (this.streamable !== undefined && !this.isField) {
            (base as CommandInputParameter).streamable = this.streamable;
        }

        if (this.secondaryFiles && !this.isField) {
            (base as CommandInputParameter).secondaryFiles = this.secondaryFiles.map(f => f.serialize());
        }

        return base;
    }

    deserialize(attr: CommandInputParameter | CommandInputRecordField): void {
        const serializedKeys = ["type", "doc", "inputBinding", "label", "secondaryFiles", "format", "streamable"];

        if ((<CommandInputRecordField> attr).name) {
            this.id      = (<CommandInputRecordField> attr).name;
            this.isField = true;
            serializedKeys.push("name");
        } else {
            this.id = (<CommandInputParameter> attr).id;
            serializedKeys.push("id");
        }

        this.type = new ParameterTypeModel(attr.type, V1CommandInputParameterModel, `${this.loc}.type`, this.eventHub);
        this.type.setValidationCallback(err => this.updateValidity(err));
        this.type.hasDirectoryType = true;

        if (attr.inputBinding) {
            this.inputBinding = new V1CommandLineBindingModel(attr.inputBinding, `${this.loc}.inputBinding`);
            this.inputBinding.setValidationCallback(err => this.updateValidity(err));
        }

        this.label          = attr.label;
        this.description    = ensureArray(attr.doc).join('\n');
        this.secondaryFiles = ensureArray((<CommandInputParameter> attr).secondaryFiles).map((f, i) => {
            const file = new V1ExpressionModel(f, `${this.loc}.secondaryFiles[${i}]`);
            file.setValidationCallback(err => this.updateValidity(err));
            return file;
        });
        this.fileTypes      = commaSeparatedToArray(attr["format"]);
        this.streamable     = (<CommandInputParameter> attr).streamable;

        spreadSelectProps(attr, this.customProps, serializedKeys);
    }
}
