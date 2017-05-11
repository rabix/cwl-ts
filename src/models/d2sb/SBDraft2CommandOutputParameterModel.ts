import {CommandOutputParameter} from "../../mappings/d2sb/CommandOutputParameter";
import {CommandOutputRecordField} from "../../mappings/d2sb/CommandOutputRecordField";
import {CommandOutputParameterModel} from "../generic/CommandOutputParameterModel";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {commaSeparatedToArray, spreadAllProps, spreadSelectProps} from "../helpers/utils";
import {Serializable} from "../interfaces/Serializable";
import {SBDraft2CommandOutputBindingModel} from "./SBDraft2CommandOutputBindingModel";

export class SBDraft2CommandOutputParameterModel extends CommandOutputParameterModel implements Serializable<CommandOutputParameter | CommandOutputRecordField> {

    /** Flag if output is field of a parent record. Derived from type */
    public isField: boolean;

    /** Binding for connecting output files and CWL output description */
    public outputBinding: SBDraft2CommandOutputBindingModel;

    public hasSecondaryFiles = false;

    constructor(output?: CommandOutputParameter | CommandOutputRecordField, loc?: string) {
        super(loc);
        this.deserialize(output || <CommandOutputParameter>{});
    }

    public updateOutputBinding(binding?: SBDraft2CommandOutputBindingModel) {
        this.outputBinding     = binding || new SBDraft2CommandOutputBindingModel();
        this.outputBinding.loc = `${this.loc}.outputBinding`;
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

        this.outputBinding = new SBDraft2CommandOutputBindingModel(attr.outputBinding);
        this.outputBinding.setValidationCallback(err => this.updateValidity(err));

        this.type = new ParameterTypeModel(attr.type, SBDraft2CommandOutputParameterModel, `${this.loc}.type`);
        this.type.setValidationCallback(err => this.updateValidity(err));

        spreadSelectProps(attr, this.customProps, serializedAttr);
    }

    validate(): Promise<any> {
        this.cleanValidity();
        const promises = [];

        promises.push(this.outputBinding.validate());
        promises.push(this.type.validate());

        return Promise.all(promises).then(() => this.issues);
    }
}