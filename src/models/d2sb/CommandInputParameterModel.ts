import {CommandInputParameter} from "../../mappings/d2sb/CommandInputParameter";
import {CommandLineInjectable} from "../../models/interfaces/CommandLineInjectable";
import {CommandLinePart} from "../helpers/CommandLinePart";
import {Datatype} from "../../mappings/d2sb/Datatype";
import {CommandInputSchema} from "../../mappings/d2sb/CommandInputSchema";
import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {TypeResolver, TypeResolution} from "../helpers/TypeResolver";
import {ExpressionEvaluator} from "../helpers/ExpressionEvaluator";

export class CommandInputParameterModel implements CommandInputParameter, CommandLineInjectable {
    id: string;

    isRequired: boolean = true;
    items: string;
    itemsBinding: CommandLineBinding;
    fields: Array<CommandInputParameterModel>;
    symbols: Array<string>;
    resolvedType: string;

    type: Datatype | CommandInputSchema | string | Array<Datatype | CommandInputSchema | string>;
    inputBinding: CommandLineBinding;
    label: string;
    description: string;

    constructor(input: CommandInputParameter) {
        this.id          = input.id || (<any> input).name; // for record fields
        this.type        = input.type;
        this.label       = input.label;
        this.description = input.description;

        this.inputBinding = input.inputBinding;

        const resolved: TypeResolution = TypeResolver.resolveType(input.type);

        this.resolvedType = resolved.type;
        this.fields       = resolved.fields ? resolved.fields.map(field => {
            return new CommandInputParameterModel(field);
        }) : resolved.fields;
        this.items        = resolved.items;
        this.symbols      = resolved.symbols;
        this.isRequired   = resolved.isRequired;

        this.itemsBinding = resolved.itemsBinding;
    }

    getCommandPart(job?: any, value?: any, self?: any): CommandLinePart {

        // only include if they have command line binding
        if (!this.inputBinding || !(!!value)) {
            return null;
        }

        // If type declared does not match type of value, throw error
        if (!TypeResolver.doesTypeMatch(this.resolvedType, value)) {
            // If there are items, only throw exception if items don't match either
            if (!this.items || !TypeResolver.doesTypeMatch(this.items, value)) {
                throw(`Mismatched value and type definition expected for ${this.id}. ${this.resolvedType} 
                or ${this.items}, but instead got ${typeof value}`);
            }
        }

        let prefix      = this.inputBinding.prefix || "";
        const separator = (!!prefix && this.inputBinding.separate !== false) ? " " : "";
        const position  = this.inputBinding.position || 0;
        const itemSeparator = this.inputBinding.itemSeparator;

        const itemsPrefix = (this.itemsBinding && this.itemsBinding.prefix)
            ? this.itemsBinding.prefix : '';

        // array
        if (Array.isArray(value)) {
            const parts                 = value.map(val => this.getCommandPart(job, val));
            let calculatedValue: string = '';

            parts.forEach(part => {
                calculatedValue += " " + part.value;
            });

            // if array has itemSeparator, resolve as --prefix [separate] value1(delimiter) value2(delimiter) value3
            if (itemSeparator) {
                calculatedValue = prefix + separator + parts.map((val) => {
                        return val.value;
                        // return this.resolveValue(job, val, this.inputBinding);
                    }).join(itemSeparator);

                // null separator, resolve as --prefix [separate] value1
                // --prefix [separate] value2 --prefix [separate] value3
            } else if (itemSeparator === null) {
                calculatedValue = parts.map((val) => {
                    return prefix + separator + val.value;
                }).join( + " ");
            } else {
                calculatedValue = prefix + separator + parts
                        .map(val => itemsPrefix  + separator + val.value)
                        .join(" ");
            }

            return new CommandLinePart(calculatedValue, [position, this.id]);
        }

        // record
        if (typeof value === "object") {
            // make sure object isn't a file, resolveValue handles files
            if (!value.path) {
                // evaluate record by calling generate part for each field
                let parts = this.fields.map((field) => field.getCommandPart(job, value[field.id]));

                let calculatedValue: string = '';

                parts.forEach((part) => {
                    calculatedValue += " " + part.value;
                });

                return new CommandLinePart(calculatedValue, [position, this.id]);
            }
        }

        // not record or array
        // if the input has items, this is a recursive call and prefix should not be added again
        prefix              = this.items ? '' : prefix;
        let calculatedValue = prefix + separator + this.resolveValue(job, value, this.inputBinding);
        return new CommandLinePart(calculatedValue, [position, this.id]);
    }

    private resolveValue(jobInputs: any, value: any, inputBinding: CommandLineBinding) {
        if (inputBinding.valueFrom) {
            return ExpressionEvaluator.evaluateD2(inputBinding.valueFrom, jobInputs, value);
        }

        if (value.path) {
            value = value.path;
        }

        return value;
    }
}