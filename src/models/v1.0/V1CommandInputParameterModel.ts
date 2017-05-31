import {CommandInputParameter, CommandInputRecordField} from "../../mappings/v1.0";
import {CommandInputParameterModel} from "../generic/CommandInputParameterModel";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {Serializable} from "../interfaces/Serializable";
import {
    commaSeparatedToArray, ensureArray, incrementLastLoc, spreadSelectProps
} from "../helpers/utils";
import {V1CommandLineBindingModel} from "./V1CommandLineBindingModel";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {EventHub} from "../helpers/EventHub";
import {Expression} from "../../mappings/v1.0/Expression";

export class V1CommandInputParameterModel extends CommandInputParameterModel implements Serializable<CommandInputParameter
    | CommandInputRecordField> {
    public inputBinding: V1CommandLineBindingModel;
    public secondaryFiles: V1ExpressionModel[] = [];
    public streamable: boolean;

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

    addSecondaryFile(file: Expression | string): V1ExpressionModel {
        const loc = incrementLastLoc(this.secondaryFiles, `${this.loc}.secondaryFiles`);
        const f   = new V1ExpressionModel(file, loc, this.eventHub);
        f.setValidationCallback(err => this.updateValidity(err));
        this.secondaryFiles.push(f);

        return f;
    }

    updateSecondaryFiles(files: Array<Expression | Expression | string>) {
        this.secondaryFiles = [];
        files.forEach(f => this.addSecondaryFile(f));
    }


    removeSecondaryFile(index: number) {
        const file = this.secondaryFiles[index];
        if (file) {
            file.setValue("", "string");
            this.secondaryFiles.splice(index, 1);
        }
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
            (base as CommandInputParameter).secondaryFiles = this.secondaryFiles.map(f => f.serialize()).filter(f => !!f);
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
            this.inputBinding = new V1CommandLineBindingModel(attr.inputBinding, `${this.loc}.inputBinding`, this.eventHub);
            this.inputBinding.setValidationCallback(err => this.updateValidity(err));
        }

        this.label          = attr.label;
        this.description    = ensureArray(attr.doc).join('\n');
        this.secondaryFiles = ensureArray((<CommandInputParameter> attr).secondaryFiles).map(f => this.addSecondaryFile(f));
        this.fileTypes      = commaSeparatedToArray(attr["format"]);
        this.streamable     = (<CommandInputParameter> attr).streamable;

        spreadSelectProps(attr, this.customProps, serializedKeys);
    }
}
