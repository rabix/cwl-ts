import {CommandOutputParameter} from "../../mappings/d2sb/CommandOutputParameter";
import {Serializable} from "../interfaces/Serializable";
import {CommandOutputBindingModel} from "./CommandOutputBindingModel";
import {Validation} from "../helpers/validation/Validation";
import {CommandOutputRecordField} from "../../mappings/d2sb/CommandOutputRecordField";
import {CommandOutputParameterModel as GenericCommandOutputParameterModel} from "../generic/CommandOutputParameterModel"
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {spreadSelectProps} from "../helpers/utils";

export class CommandOutputParameterModel extends GenericCommandOutputParameterModel implements Serializable<CommandOutputParameter | CommandOutputRecordField> {

    /** Unique identifier of output */
    public id: string;
    /** Human readable short name */
    public label: string;
    /** Human readable description */
    public description: string;

    /** Flag if output is field of a parent record. Derived from type */
    public isField: boolean;

    /** Complex object that holds logic and information about output's type property */
    public type: ParameterTypeModel;

    /** Binding for connecting output files and CWL output description */
    public outputBinding: CommandOutputBindingModel;

    /** Description of file types expected for output to be */
    public fileTypes: string[];

    customProps: any = {};

    constructor(output?: CommandOutputParameter | CommandOutputRecordField, loc?: string) {
        super(loc);
        this.deserialize(output || <CommandOutputParameter>{});
    }

    updateOutputBinding(binding?: CommandOutputBindingModel) {
        this.outputBinding     = binding || new CommandOutputBindingModel();
        this.outputBinding.loc = `${this.loc}.outputBinding`;
        this.outputBinding.setValidationCallback((err) => this.updateValidity(err));
    }

    serialize(): CommandOutputParameter | CommandOutputRecordField {
        let base: any = {};
        base          = Object.assign({}, base, this.customProps);

        base.type = this.type.serialize();

        if (this.label) base.label = this.label;
        if (this.description) base.description = this.description;
        if (this.fileTypes) base["sbg:fileTypes"] = this.fileTypes;

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

        return base;
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
        this.fileTypes   = attr["sbg:fileTypes"];

        this.outputBinding = new CommandOutputBindingModel(attr.outputBinding);
        this.outputBinding.setValidationCallback(err => this.updateValidity(err));

        this.type = new ParameterTypeModel(attr.type, CommandOutputParameterModel, `${this.loc}.type`);
        this.type.setValidationCallback(err => this.updateValidity(err));

        spreadSelectProps(attr, this.customProps, serializedAttr);
    }

    validate(): Validation {
        //@fixme context should be passed with constructor if model can have expressions
        const val = {errors: [], warnings: []};

        //@fixme outputBinding validation isn't implemented
        this.outputBinding.validate();
        this.type.validate();

        const errors   = this.validation.errors.concat(val.errors);
        const warnings = this.validation.warnings.concat(val.warnings);

        this.validation = {errors, warnings};

        return this.validation;
    }
}