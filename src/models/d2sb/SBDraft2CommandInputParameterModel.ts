import {CommandInputParameter} from "../../mappings/d2sb/CommandInputParameter";
import {CommandInputRecordField} from "../../mappings/d2sb/CommandInputRecordField";
import {Expression} from "../../mappings/d2sb/Expression";
import {CommandInputParameterModel} from "../generic/CommandInputParameterModel";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {ID_REGEX} from "../helpers/constants";
import {EventHub} from "../helpers/EventHub";
import {ensureArray, incrementLastLoc, spreadSelectProps} from "../helpers/utils";
import {Serializable} from "../interfaces/Serializable";
import {SBDraft2CommandLineBindingModel} from "./SBDraft2CommandLineBindingModel";
import {SBDraft2ExpressionModel} from "./SBDraft2ExpressionModel";

export class SBDraft2CommandInputParameterModel extends CommandInputParameterModel implements Serializable<CommandInputParameter
    | CommandInputRecordField> {
    /** Binding for inclusion in command line */
    public inputBinding: SBDraft2CommandLineBindingModel = null;

    public hasSecondaryFiles = false;
    public hasSecondaryFilesInRoot = false;
    public hasStageInput     = true;
    public secondaryFiles: SBDraft2ExpressionModel[] = [];


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

            if (this.type.type === "File" || this.type.items === "File") {
                base.inputBinding.secondaryFiles = this.secondaryFiles.map(f => f.serialize()).filter(f => !!f);
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
            this.inputBinding = new SBDraft2CommandLineBindingModel(input.inputBinding, `${this.loc}.inputBinding`, this.eventHub);
            this.inputBinding.setValidationCallback((err) => this.updateValidity(err));

            if (input.inputBinding.secondaryFiles) {
                this.secondaryFiles = ensureArray(input.inputBinding.secondaryFiles).map(f => this.addSecondaryFile(f));
            }
        }

        this.type = new ParameterTypeModel(input.type, SBDraft2CommandInputParameterModel, `${this.loc}.type`, this.eventHub);
        this.type.setValidationCallback((err) => {
            this.updateValidity(err);
        });

        // populates object with all custom attributes not covered in model
        spreadSelectProps(input, this.customProps, serializedAttr);
    }

    public updateInputBinding(binding: SBDraft2CommandLineBindingModel) {
        if (binding instanceof SBDraft2CommandLineBindingModel) {
            //@todo breaks here for serialize of undefined
            // this.updateSecondaryFiles(ensureArray(binding.secondaryFiles));
            this.inputBinding.setValidationCallback(err => this.updateValidity(err));
            this.inputBinding.cloneStatus(binding);
        }
    }

    public createInputBinding(): SBDraft2CommandLineBindingModel {
        this.inputBinding = new SBDraft2CommandLineBindingModel({}, `${this.loc}.inputBinding`, this.eventHub);
        this.inputBinding.setValidationCallback(err => this.updateValidity(err));
        return this.inputBinding;
    }

    addSecondaryFile(file: Expression | string): SBDraft2ExpressionModel {
        if (this.inputBinding) {
            const loc = incrementLastLoc(this.secondaryFiles, `${this.inputBinding.loc}.secondaryFiles`);
            const f   = new SBDraft2ExpressionModel(file, loc, this.eventHub);
            this.secondaryFiles.push(f);
            f.setValidationCallback(err => this.updateValidity(err));
            return f;
        }
    }

    updateSecondaryFiles(files: Array<Expression | Expression | string>) {
        if (this.inputBinding) {
            this.secondaryFiles = [];
            files.forEach(f => this.addSecondaryFile(f));
        }
    }

    removeSecondaryFile(index: number) {
        if (this.inputBinding) {
            const file = this.secondaryFiles[index];
            if (file) {
                file.setValue("", "string");
                this.secondaryFiles.splice(index, 1);
            }
        }
    }

// //@todo(maya) implement validation
    validate(context): Promise<any> {
        const promises = [];
        this.cleanValidity();

        if (this.inputBinding) {
            promises.push(this.inputBinding.validate(context));
        }

        promises.push(this.type.validate());

        if (this.secondaryFiles) {
            promises.concat(this.secondaryFiles.map(file => file.validate(context)));
        }

        // check id validity
        // doesn't exist
        if (this.id === "" || this.id === undefined) {
            this.updateValidity({
                [`${this.loc}.id`]: {
                    message: "ID must be set",
                    type: "error"
                }
            });
            // contains illegal characters
        } else if (!ID_REGEX.test(this.id.charAt(0) === "#" ? this.id.substring(1) : this.id)) {
            this.updateValidity({
                [`${this.loc}.id`]: {
                    message: "ID can only contain alphanumeric and underscore characters",
                    type: "error"
                }
            });
        }

        return Promise.all(promises).then(() => this.issues, (ex) => {
            console.warn(`SBDraft2CommandInputParameterModel threw error in validation: ${ex}`);
            return this.issues
        });
    }
}