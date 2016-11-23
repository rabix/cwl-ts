import {CommandInputParameter} from "../../mappings/d2sb/CommandInputParameter";
import {CommandLineInjectable} from "../interfaces/CommandLineInjectable";
import {CommandLinePart} from "../helpers/CommandLinePart";
import {TypeResolver} from "../helpers/TypeResolver";
import {CommandInputRecordField} from "../../mappings/d2sb/CommandInputRecordField";
import {Expression} from "../../mappings/d2sb/Expression";
import {Serializable} from "../interfaces/Serializable";
import {CommandLineBindingModel} from "./CommandLineBindingModel";
import {ExpressionModel} from "./ExpressionModel";
import {ValidationBase, Validation} from "../helpers/validation";
import {InputParameterTypeModel} from "./InputParameterTypeModel";

export class CommandInputParameterModel extends ValidationBase implements Serializable<CommandInputParameter | CommandInputRecordField>, CommandLineInjectable {
    /** unique identifier of input */
    public id: string;
    /** Human readable short name */
    public label: string;
    /** Human readable, Markdown format description */
    public description: string;

    /** Flag if input is field of a parent record. Derived from type field */
    public isField: boolean    = false;

    /** Complex object that holds logic and information about input's type property */
    public type: InputParameterTypeModel;

    /** Binding for inclusion in command line */
    private inputBinding: CommandLineBindingModel = null;

    public job: any; //@todo better way to set job?

    public self: any; //@todo calculate self based on id??

    public customProps: any = {};

    constructor(loc: string, input?: CommandInputParameter | CommandInputRecordField) {
        super(loc);
        this.deserialize(input);
    }

    serialize(): CommandInputParameter | CommandInputRecordField {
        let base: any = {};
        base = Object.assign({}, base, this.customProps);

        base.type = this.type.serialize();

        if (this.inputBinding) {
            base.inputBinding = this.inputBinding.serialize();
        }

        if (this.label) base.label = this.label;
        if (this.description) base.description = this.description;

        if (this.isField) {
            base.name = this.id;
            return <CommandInputRecordField> base;
        } else {
            base.id = this.id;
            return <CommandInputParameter> base;
        }
    }

    deserialize(input: CommandInputParameter | CommandInputRecordField): void {
        const serializedAttr = ["label", "description", "inputBinding", "type"];

        input = input || <CommandInputParameter | CommandInputRecordField>{};

        this.isField     = !!(<CommandInputRecordField> input).name; // record fields don't have ids
        this.isField ? serializedAttr.push("name") : serializedAttr.push("id");

        this.id          = (<CommandInputParameter> input).id
            || (<CommandInputRecordField> input).name || ""; // for record fields
        this.label       = input.label;
        this.description = input.description;

        // if inputBinding isn't defined in input, it shouldn't exist as an object in model
        this.inputBinding = input.inputBinding !== undefined ?
            new CommandLineBindingModel(`${this.loc}.inputBinding`, input.inputBinding) : null;

        if (this.inputBinding) {
            this.inputBinding.setValidationCallback((err: Validation) => this.updateValidity(err));
        }

        this.type = new InputParameterTypeModel(input.type, `${this.loc}.type`);
        this.type.setValidationCallback((err: Validation) => { this.updateValidity(err) });

        // populates object with all custom attributes not covered in model
        Object.keys(input).forEach(key => {
            if (serializedAttr.indexOf(key) === -1) {
                this.customProps[key] = input[key];
            }
        });
    }

    getCommandPart(job?: any, value?: any, self?: any): CommandLinePart {

        // only include if they have command line binding
        if (!this.inputBinding || typeof value === "undefined") {
            return null;
        }

        // If type declared does not match type of value, throw error
        if (!TypeResolver.doesTypeMatch(this.type.type, value)) {
            // If there are items, only throw exception if items don't match either
            if (!this.type.items || !TypeResolver.doesTypeMatch(this.type.items, value)) {
                throw(`Mismatched value and type definition expected for ${this.id}. ${this.type.type} 
                or ${this.type.items}, but instead got ${typeof value}`);
            }
        }

        let prefix          = this.inputBinding.prefix || "";
        const separator     = (!!prefix && this.inputBinding.separate !== false) ? " " : "";
        const position      = this.inputBinding.position || 0;
        const itemSeparator = this.inputBinding.itemSeparator;

        const itemsPrefix = (this.type.typeBinding && this.type.typeBinding.prefix)
            ? this.type.typeBinding.prefix : '';

        // array
        if (Array.isArray(value)) {
            const parts         = value.map(val => this.getCommandPart(job, val));
            let calcVal: string = '';

            // if array has itemSeparator resolve as
            // --prefix [separate] value1(delimiter)value2(delimiter)value3
            if (itemSeparator) {
                calcVal = prefix + separator + parts.map((val) => {
                        return val.value;
                        // return this.resolve(job, val, this.inputBinding);
                    }).join(itemSeparator);

                // null separator, resolve as
                // --prefix [separate] value1
                // --prefix [separate] value2
                // --prefix [separate] value3

            } else if (itemSeparator === null) {
                calcVal = parts.map((val) => {
                    return prefix + separator + val.value;
                }).join(" ");

                // no separator, resolve as
                // --prefix [separate] (itemPrefix) value1
                // (itemPrefix) value2
                // (itemPrefix) value3
            } else {
                // booleans are a special
                if (this.type.items === "boolean") {
                    calcVal = prefix + separator + parts
                            .map(part => part.value)
                            .join(" ").trim();
                } else {
                    const itemPrefSep = this.inputBinding.separate !== false ? " " : "";
                    const joiner      = !!itemsPrefix ? " " : "";
                    calcVal           = prefix + separator + parts
                            .map(part => itemsPrefix + itemPrefSep + part.value)
                            .join(joiner).trim();
                }

            }

            return new CommandLinePart(calcVal, [position, this.id], "input");
        }

        // record
        if (typeof value === "object") {
            // make sure object isn't a file, resolve handles files
            if (!value.path) {
                // evaluate record by calling generate part for each field
                const parts = this.type.fields.map((field) => field.getCommandPart(job, value[field.id]));

                let calcVal: string = '';

                parts.forEach((part) => {
                    calcVal += " " + part.value;
                });

                return new CommandLinePart(calcVal, [position, this.id], "input");
            }
        }

        // boolean should only include prefix and valueFrom (booleans === flags)
        if (typeof value === "boolean") {
            if (value) {
                prefix        = this.type.items === "boolean" ? itemsPrefix : prefix;
                const calcVal = prefix + separator + this.resolve({
                        $job: job,
                        $self: ''
                    }, this.inputBinding);
                if (this.inputBinding.valueFrom && this.inputBinding.valueFrom.validation.errors.length) {
                    return new CommandLinePart(`<Error at ${this.inputBinding.valueFrom.loc}>`, [position, this.id], "error");
                }
                if (this.inputBinding.valueFrom && this.inputBinding.valueFrom.validation.warnings.length) {
                    return new CommandLinePart(`<Warning at ${this.inputBinding.valueFrom.loc}>`, [position, this.id], "warning");
                }
                return new CommandLinePart(calcVal, [position, this.id], "input");
            } else {
                return new CommandLinePart('', [position, this.id], "input");
            }
        }

        // not record or array or boolean
        // if the input has items, this is a recursive call and prefix should not be added again
        prefix        = this.type.items ? '' : prefix;
        const calcVal = prefix + separator + this.resolve({
                $job: job,
                $self: value
            }, this.inputBinding);
        if (this.inputBinding.valueFrom && this.inputBinding.valueFrom.validation.errors.length) {
            return new CommandLinePart(`<Error at ${this.inputBinding.valueFrom.loc}>`, [position, this.id], "error");
        }
        if (this.inputBinding.valueFrom && this.inputBinding.valueFrom.validation.warnings.length) {
            return new CommandLinePart(`<Warning at ${this.inputBinding.valueFrom.loc}>`, [position, this.id], "warning");
        }
        return new CommandLinePart(calcVal, [position, this.id], "input");
    }

    private resolve(context: {$job: any, $self: any}, inputBinding: CommandLineBindingModel): any {
        if (inputBinding.valueFrom) {
            return inputBinding.valueFrom.evaluate(context);
        }

        let value = context.$self;

        if (value.path) {
            value = value.path;
        }

        return value;
    }

    public setValueFrom(value: string | Expression): void {
        if (!this.inputBinding) {
            this.createInputBinding();
        }
        this.inputBinding.setValueFrom(value);
    }

    public getValueFrom(): ExpressionModel {
        return this.inputBinding ? this.inputBinding.valueFrom : undefined;
    }

    public createInputBinding() {
        this.inputBinding = new CommandLineBindingModel(`${this.loc}.inputBinding`, {});
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
        const val = {errors: [], warnings: []}; // purge current validation;

        const location = this.isField ? "fields[<fieldIndex>]" : "inputs[<inputIndex>]";

        if (this.inputBinding && this.inputBinding.valueFrom) {
            this.inputBinding.valueFrom.evaluate({$job: this.job, $self: this.self});
        }

        // check id validity
        // doesn't exist
        if (this.id === "" || this.id === undefined) {
            val.errors.push({
                message: "ID must be set",
                loc: `${this.loc}.id`
            });
            // contains illegal characters
        } else if (!/^[a-zA-Z0-9_]*$/.test(this.id.charAt(0) === "#" ? this.id.substring(1) : this.id)) {
            val.errors.push({
                message: "ID can only contain alphanumeric and underscore characters",
                loc: `${this.loc}.id`
            });
        }

        // check type
        // if array, has items. Does not have symbols or items
        if (this.type.type === "array") {
            if (this.type.items === null) {
                val.errors.push({
                    message: "Type array must have items",
                    loc: location
                });
            }
            if (this.type.symbols !== null) {
                val.errors.push({
                    message: "Type array must not have symbols",
                    loc: location
                });
            }
            if (this.type.fields !== null) {
                val.errors.push({
                    message: "Type array must not have fields",
                    loc: location
                });
            }
        }
        // if enum, has symbols. Does not have items or fields. Has name.
        if (this.type.type === "enum") {
            if (this.type.items !== null) {
                val.errors.push({
                    message: "Type enum must not have items",
                    loc: location
                });
            }
            if (this.type.symbols === null) {
                val.errors.push({
                    message: "Type enum must have symbols",
                    loc: location
                });
            }
            if (this.type.fields !== null) {
                val.errors.push({
                    message: "Type enum must not have fields",
                    loc: location
                });
            }

            if (!this.type.name) {
                val.errors.push({
                    message: "Type enum must have a name",
                    loc: location
                });
            }
        }
        // if record, has fields. Does not have items or symbols. Has name.
        if (this.type.type === "enum") {
            if (this.type.items !== null) {
                val.errors.push({
                    message: "Type record must not have items",
                    loc: location
                });
            }
            if (this.type.symbols === null) {
                val.errors.push({
                    message: "Type record must have symbols",
                    loc: location
                });
            }
            if (this.type.fields === null) {
                val.errors.push({
                    message: "Type record must have fields",
                    loc: location
                });
            } else {
                // check validity for each field.
                // @todo check uniqueness of each field name
            }

            if (!this.type.name) {
                val.errors.push({
                    message: "Type record must have a name",
                    loc: location
                });
            }
        }

        const errors   = this.validation.errors.concat(val.errors);
        const warnings = this.validation.warnings.concat(val.warnings);

        this.validation = {errors, warnings};

        return this.validation;
    }
}