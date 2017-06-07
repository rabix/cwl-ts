import {CommandOutputParameter} from "../../mappings/d2sb/CommandOutputParameter";
import {CommandOutputRecordField} from "../../mappings/d2sb/CommandOutputRecordField";
import {CommandOutputParameterModel} from "../generic/CommandOutputParameterModel";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {
    commaSeparatedToArray, incrementLastLoc, isType, spreadAllProps,
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
            this.secondaryFiles = [];
            files.forEach(f => this.addSecondaryFile(f));
        }
    }

    addSecondaryFile(file: Expression | string): SBDraft2ExpressionModel {
        if (this.outputBinding) {
            const loc = incrementLastLoc(this.outputBinding.secondaryFiles, `${this.outputBinding.loc}.secondaryFiles`);
            const f   = new SBDraft2ExpressionModel(file, loc, this.eventHub);
            this.secondaryFiles.push(f);
            f.setValidationCallback(err => this.updateValidity(err));
            return f;
        }
    }

    removeSecondaryFile(index: number) {
        if (this.outputBinding) {
            const file = this.secondaryFiles[index];
            if (file) {
                file.setValue("", "string");
                this.secondaryFiles.splice(index, 1);
            }
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

        if (this.label) base.label = this.label;
        if (this.description) base.description = this.description;
        if (this.fileTypes && this.fileTypes.length) {
            base["sbg:fileTypes"] = (this.fileTypes || []).join(", ");
        }

        if (this.outputBinding) {
            base.outputBinding = this.outputBinding.serialize();

            // only type File or File[] can have secondaryFiles, loadContents and fileTypes
            if (this.type.type !== "File" && this.type.items !== "File") {
                delete base.outputBinding.secondaryFiles;
                delete base.outputBinding.loadContents;
                delete base["sbg:fileTypes"];
            }

            if ((this.type.type === "File" || this.type.items === "File") && this.secondaryFiles.length > 0) {
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

        this.type = new ParameterTypeModel(attr.type, SBDraft2CommandOutputParameterModel, `${this.id}_field`,`${this.loc}.type`);
        this.type.setValidationCallback(err => this.updateValidity(err));

        if (isType(this, ["record", "enum"]) && !this.type.name) {
            this.type.name = this.id;
        }

        spreadSelectProps(attr, this.customProps, serializedAttr);
    }
}