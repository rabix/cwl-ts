import {CommandInputParameter} from "../../mappings/d2sb/CommandInputParameter";
import {CommandInputRecordField} from "../../mappings/d2sb/CommandInputRecordField";
import {Serializable} from "../interfaces/Serializable";
import {SBDraft2CommandLineBindingModel} from "./SBDraft2CommandLineBindingModel";
import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {CommandInputParameterModel} from "../generic/CommandInputParameterModel";
import {spreadSelectProps} from "../helpers/utils";
import {EventHub} from "../helpers/EventHub";

export class SBDraft2CommandInputParameterModel extends CommandInputParameterModel implements Serializable<
    CommandInputParameter
    | CommandInputRecordField> {
    /** Binding for inclusion in command line */
    public inputBinding: SBDraft2CommandLineBindingModel = null;

    public hasSecondaryFiles = false;
    public hasStageInput = true;

    public job: any;

    public self: any;

    constructor(input?: CommandInputParameter | CommandInputRecordField, loc?: string, eventHub?: EventHub) {
        super(loc, eventHub);
        this.deserialize(input);
    }

    serialize(): CommandInputParameter | CommandInputRecordField {
        let base: any = {...this.customProps};

        base.type = this.type.serialize();

        if (this.inputBinding) {
            base.inputBinding = this.inputBinding.serialize();

            if (this.type.type !== "File" && this.type.items !== "File") {
                delete base.inputBinding.secondaryFiles;
            }
        }

        if (this.label) base.label = this.label;
        if (this.description) base.description = this.description;

        if (this.isField) {
            base.name = this.id;
            return <CommandInputRecordField> base;
        } else {
            base.id = this.id ? "#" + this.id : "";
            return <CommandInputParameter> base;
        }
    }

    deserialize(input: CommandInputParameter | CommandInputRecordField): void {
        const serializedAttr = ["label", "description", "inputBinding", "type"];

        input = input || <CommandInputParameter | CommandInputRecordField>{};

        this.isField = !!(<CommandInputRecordField> input).name; // record fields don't have ids
        this.isField ? serializedAttr.push("name") : serializedAttr.push("id");

        if ((<CommandInputParameter> input).id && (<CommandInputParameter> input).id.charAt(0) === "#") {
            this.id = (<CommandInputParameter> input).id.substr(1);
        } else {
            this.id = (<CommandInputParameter> input).id
                || (<CommandInputRecordField> input).name || ""; // for record fields
        }

        this.label       = input.label;
        this.description = input.description;

        // if inputBinding isn't defined in input, it shouldn't exist as an object in model
        if (input.inputBinding !== undefined) {
            this.inputBinding = new SBDraft2CommandLineBindingModel(input.inputBinding, `${this.loc}.inputBinding`);
            this.inputBinding.setValidationCallback((err) => this.updateValidity(err));
        }

        this.type = new ParameterTypeModel(input.type, SBDraft2CommandInputParameterModel, `${this.loc}.type`, this.eventHub);
        this.type.setValidationCallback((err) => {
            this.updateValidity(err);
        });

        // populates object with all custom attributes not covered in model
        spreadSelectProps(input, this.customProps, serializedAttr);
    }

    public updateInputBinding(binding: SBDraft2CommandLineBindingModel | CommandLineBinding) {
        if (binding instanceof SBDraft2CommandLineBindingModel) {
            binding = (binding as SBDraft2CommandLineBindingModel).serialize();
        }
        this.inputBinding = new SBDraft2CommandLineBindingModel(<CommandLineBinding> binding, `${this.loc}.inputBinding`);
        this.inputBinding.setValidationCallback(err => this.updateValidity(err));

    }

    public createInputBinding(): SBDraft2CommandLineBindingModel {
        this.inputBinding = new SBDraft2CommandLineBindingModel({}, `${this.loc}.inputBinding`);
        this.inputBinding.setValidationCallback(err => this.updateValidity(err));
        return this.inputBinding;
    }

    // //@todo(maya) implement validation
    // validate(): Validation {
    //     this.validation = {errors: [], warnings: []}; // purge current validation;
    //
    //     // if (this.inputBinding && this.inputBinding.valueFrom) {
    //     //     this.inputBinding.valueFrom.evaluate({$job: this.job, $self: this.self});
    //     // }
    //
    //     // check id validity
    //     // doesn't exist
    //     if (this.id === "" || this.id === undefined) {
    //         this.validation.errors.push({
    //             message: "ID must be set",
    //             loc: `${this.loc}.id`
    //         });
    //         // contains illegal characters
    //     } else if (!ID_REGEX.test(this.id.charAt(0) === "#" ? this.id.substring(1) : this.id)) {
    //         this.validation.errors.push({
    //             message: "ID can only contain alphanumeric and underscore characters",
    //             loc: `${this.loc}.id`
    //         });
    //     }
    //
    //     this.type.validate();
    //
    //     return this.validation;
    // }
}