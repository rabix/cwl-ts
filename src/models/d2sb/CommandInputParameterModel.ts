import {CommandInputParameter} from "../../mappings/d2sb/CommandInputParameter";
import {CommandInputRecordField} from "../../mappings/d2sb/CommandInputRecordField";
import {Serializable} from "../interfaces/Serializable";
import {CommandLineBindingModel} from "./CommandLineBindingModel";
import {ValidationBase, Validation} from "../helpers/validation";
import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";

export class CommandInputParameterModel extends ValidationBase implements Serializable<CommandInputParameter | CommandInputRecordField> {
    /** unique identifier of input */
    public id: string;
    /** Human readable short name */
    public label: string;
    /** Human readable description */
    public description: string;

    /** Flag if input is field of a parent record. Derived from type field */
    public isField: boolean = false;

    /** Complex object that holds logic and information about input's type property */
    public type: ParameterTypeModel;

    /** Binding for inclusion in command line */
    public inputBinding: CommandLineBindingModel = null;

    public job: any;

    public self: any;

    public customProps: any = {};

    constructor(input?: CommandInputParameter | CommandInputRecordField, loc?: string) {
        super(loc);
        this.deserialize(input);
    }

    serialize(): CommandInputParameter | CommandInputRecordField {
        let base: any = {};
        base          = Object.assign({}, base, this.customProps);

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

        const isNew = input === undefined;
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
        this.inputBinding = (input.inputBinding !== undefined || isNew) ?
            new CommandLineBindingModel(input.inputBinding, `${this.loc}.inputBinding`) : undefined;

        if (this.inputBinding) {
            this.inputBinding.setValidationCallback((err: Validation) => this.updateValidity(err));
        }

        this.type = new ParameterTypeModel(input.type, CommandInputParameterModel, `${this.loc}.type`);
        this.type.setValidationCallback((err: Validation) => {
            this.updateValidity(err)
        });

        // populates object with all custom attributes not covered in model
        Object.keys(input).forEach(key => {
            if (serializedAttr.indexOf(key) === -1) {
                this.customProps[key] = input[key];
            }
        });
    }

    public updateInputBinding(binding: CommandLineBindingModel|CommandLineBinding) {
        if (binding instanceof CommandLineBindingModel) {
            binding = (binding as CommandLineBindingModel).serialize();
        }
        this.inputBinding = new CommandLineBindingModel(<CommandLineBinding> binding, `${this.loc}.inputBinding`);
        this.inputBinding.setValidationCallback((err: Validation) => this.updateValidity(err));

    }

    public createInputBinding() {
        this.inputBinding = new CommandLineBindingModel({}, `${this.loc}.inputBinding`);
        this.inputBinding.setValidationCallback((err: Validation) => this.updateValidity(err));
    }

    public removeInputBinding(): void {
        this.inputBinding = null;
    }

    public get isBound(): boolean {
        return this.inputBinding !== undefined && this.inputBinding !== null;
    }

    //@todo(maya) implement validation
    validate(): Validation {
        this.validation = {errors: [], warnings: []}; // purge current validation;

        // if (this.inputBinding && this.inputBinding.valueFrom) {
        //     this.inputBinding.valueFrom.evaluate({$job: this.job, $self: this.self});
        // }

        // check id validity
        // doesn't exist
        if (this.id === "" || this.id === undefined) {
            this.validation.errors.push({
                message: "ID must be set",
                loc: `${this.loc}.id`
            });
            // contains illegal characters
        } else if (!/^[a-zA-Z0-9_]*$/.test(this.id.charAt(0) === "#" ? this.id.substring(1) : this.id)) {
            this.validation.errors.push({
                message: "ID can only contain alphanumeric and underscore characters",
                loc: `${this.loc}.id`
            });
        }

        this.type.validate();

        return this.validation;
    }
}