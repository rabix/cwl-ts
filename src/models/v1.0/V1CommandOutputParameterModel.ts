import {CommandOutputParameter} from "../../mappings/v1.0";
import {CommandOutputParameterModel} from "../generic/CommandOutputParameterModel";
import {Serializable} from "../interfaces/Serializable";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {
    commaSeparatedToArray, ensureArray, spreadAllProps,
    spreadSelectProps
} from "../helpers/utils";
import {V1CommandOutputBindingModel} from "./V1CommandOutputBindingModel";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {CommandOutputRecordField} from "../../mappings/v1.0/CommandOutputRecordField";

export class V1CommandOutputParameterModel extends CommandOutputParameterModel implements Serializable<CommandOutputParameter> {
    public label: string;
    public outputBinding: V1CommandOutputBindingModel;
    public description: string;
    public secondaryFiles: V1ExpressionModel[];
    public streamable: boolean;
    public id: string;

    public hasSecondaryFiles = true;

    constructor(output: CommandOutputParameter | CommandOutputRecordField, loc?: string) {
        super(loc);

        if (output) this.deserialize(output);
    }

    customProps: any = {};

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
            (<CommandOutputParameter> base).secondaryFiles = this.secondaryFiles.map(f => f.serialize());
        }

        if (!this.isField && this.fileTypes.length) {
            (<CommandOutputParameter> base).format = this.fileTypes;
        }

        if (!this.isField && this.streamable) {
            (<CommandOutputParameter> base).streamable = this.streamable;
        }

        return spreadAllProps(base, this.customProps);
    }

    deserialize(attr: CommandOutputParameter | CommandOutputRecordField): void {
        const serializedKeys = ["id", "type", "outputBinding", "label", "doc", "secondaryFiles", "format", "streamable"];

        this.isField = !!(<CommandOutputRecordField> attr).name; // record fields don't have ids
        this.isField ? serializedKeys.push("name") : serializedKeys.push("id");

        this.id = (<CommandOutputParameter> attr).id || (<CommandOutputRecordField> attr).name;

        this.type = new ParameterTypeModel(attr.type, V1CommandOutputParameterModel, `${this.loc}.type`);
        this.type.setValidationCallback(err => this.updateValidity(err));

        this.outputBinding = new V1CommandOutputBindingModel(attr.outputBinding, `${this.loc}.outputBinding`);
        this.outputBinding.setValidationCallback(err => this.updateValidity(err));

        this.label       = attr.label;
        this.description = ensureArray(attr.doc).join("\n\n");

        // properties only on inputs, not on fields
        this.secondaryFiles = ensureArray((<CommandOutputParameter> attr).secondaryFiles).map((f, i) => new V1ExpressionModel(f, `${this.loc}.secondaryFiles[${i}]`));
        this.fileTypes      = commaSeparatedToArray((<CommandOutputParameter> attr).format);
        this.streamable     = (<CommandOutputParameter> attr).streamable;

        spreadSelectProps(attr, this.customProps, serializedKeys);
    }
}