import {CommandOutputParameter} from "../../mappings/d2sb/CommandOutputParameter";
import {CommandOutputRecordField} from "../../mappings/d2sb/CommandOutputRecordField";
import {CommandOutputParameterModel} from "../generic/CommandOutputParameterModel";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {
    commaSeparatedToArray, isFileType, isType, spreadAllProps,
    spreadSelectProps
} from "../helpers/utils";
import {Serializable} from "../interfaces/Serializable";
import {SBDraft2CommandOutputBindingModel} from "./SBDraft2CommandOutputBindingModel";
import {Expression} from "../../mappings/d2sb/Expression";
import {SBDraft2ExpressionModel} from "./SBDraft2ExpressionModel";
import {EventHub} from "../helpers/EventHub";

export class SBDraft2CommandOutputParameterModel extends CommandOutputParameterModel implements Serializable<CommandOutputParameter | CommandOutputRecordField> {

    /** Flag if output is field of a parent record. Derived from type */
    public isField: boolean;

    /** Binding for connecting output files and CWL output description */
    public outputBinding: SBDraft2CommandOutputBindingModel;

    public secondaryFiles: SBDraft2ExpressionModel[] = [];

    public hasSecondaryFiles = false;
    public hasSecondaryFilesInRoot = false;

    constructor(output?: CommandOutputParameter | CommandOutputRecordField, loc?: string, eventHub?: EventHub) {
        super(loc, eventHub);
        this.deserialize(output || <CommandOutputParameter>{});
    }

    updateSecondaryFiles(files: Array<Expression | string>) {
        if (this.outputBinding) {
           this._updateSecondaryFiles(files);
        }
    }

    addSecondaryFile(file: Expression | string): SBDraft2ExpressionModel {
        if (this.outputBinding) {
            return this._addSecondaryFile(file, SBDraft2ExpressionModel, this.outputBinding.loc);
        }
    }

    removeSecondaryFile(index: number) {
        if (this.outputBinding) {
            this._removeSecondaryFile(index);
        }
    }

    public updateOutputBinding(binding?: SBDraft2CommandOutputBindingModel) {
        this.outputBinding     = new SBDraft2CommandOutputBindingModel(
            binding instanceof SBDraft2CommandOutputBindingModel ?
                binding.serialize() : {}, `${this.loc}.outputBinding`, this.eventHub);
        this.outputBinding.setValidationCallback((err) => this.updateValidity(err));
    }

    serialize(): CommandOutputParameter | CommandOutputRecordField {
        let base: any = {};

        base.type = this.type.serialize();

        if (this.label) {
            base.label = this.label;
        }

        if (this.description) {
            base.description = this.description;
        }

        if (isFileType(this) && this.fileTypes && this.fileTypes.length) {
            base["sbg:fileTypes"] = (this.fileTypes || []).join(", ");
        }

        if (this.outputBinding) {
            base.outputBinding = this.outputBinding.serialize();

            // only type File or File[] can have secondaryFiles, loadContents and fileTypes
            if (!isFileType(this)) {
                delete base["sbg:fileTypes"];
                delete base.outputBinding.secondaryFiles;

                // This should be done per draft2 specification
                // http://www.commonwl.org/draft-2/#commandoutputbinding
                // but it turns out that d2sb apps are using loadContents for non-file apps
                // who knows what executors are doing with this, but just leave it be and don't break old stuff
                // delete base.outputBinding.loadContents;

            }

            if (isFileType(this) && this.secondaryFiles.length > 0) {
                base.outputBinding.secondaryFiles = this.secondaryFiles.map(f => f.serialize()).filter(f => !!f);
            }


            if (!Object.keys(base.outputBinding).length) {
                delete base.outputBinding;
            }
        }

        if (this.isField) {
            base.name = this.id || "";
        } else { base.id = this.id ? "#" + this.id : ""; }

        return spreadAllProps(base, this.customProps);
    }

    deserialize(attr: CommandOutputParameter | CommandOutputRecordField): void {
        const serializedAttr = [
            "id",
            "label",
            "description",
            "outputBinding",
            "type",
            "sbg:fileTypes"
        ];

        this.isField = !!(<CommandOutputRecordField> attr).name; // record fields don't have ids
        this.isField ? serializedAttr.push("name") : serializedAttr.push("id");

        if ((<CommandOutputParameter> attr).id && (<CommandOutputParameter> attr).id.charAt(0) === "#") {
            this.id = (<CommandOutputParameter> attr).id.substr(1);
        } else {
            this.id = (<CommandOutputParameter> attr).id
                || (<CommandOutputRecordField> attr).name || ""; // for record fields
        }

        this.label       = attr.label;
        this.description = attr.description;
        this.fileTypes   = commaSeparatedToArray(attr["sbg:fileTypes"]);

        this.outputBinding = new SBDraft2CommandOutputBindingModel(attr.outputBinding, `${this.loc}.outputBinding`, this.eventHub);
        this.outputBinding.setValidationCallback(err => this.updateValidity(err));

        if (attr.outputBinding && attr.outputBinding.secondaryFiles) {
            this.secondaryFiles = attr.outputBinding.secondaryFiles.map(f => this.addSecondaryFile(f));
        }

        this.type = new ParameterTypeModel(attr.type, SBDraft2CommandOutputParameterModel, `${this.id}_field`,`${this.loc}.type`, this.eventHub);
        this.type.setValidationCallback(err => this.updateValidity(err));
        this.type.hasMapType = true;

        if (isType(this, ["record", "enum"]) && !this.type.name) {
            this.type.name = this.id;
        }

        this.attachFileTypeListeners();

        spreadSelectProps(attr, this.customProps, serializedAttr);
    }
}
