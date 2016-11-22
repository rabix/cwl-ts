import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {Serializable} from "../interfaces/Serializable";
import {ExpressionModel} from "./ExpressionModel";
import {Expression} from "../../mappings/d2sb/Expression";
import {ValidationBase, Validation} from "../helpers/validation";

export class CommandLineBindingModel extends ValidationBase implements Serializable<CommandLineBinding> {
    public position: number;
    public prefix: string;
    public separate: boolean;
    public itemSeparator: string;
    public valueFrom: ExpressionModel;

    public customProps: any = {};
    private serializedKeys: string[] = ["position", "prefix", "separate", "itemSeparator", "valueFrom"];

    constructor(loc: string, binding: CommandLineBinding) {
        super(loc);

        this.deserialize(binding);
    }

    setValueFrom(val: string | Expression) {
        this.valueFrom = new ExpressionModel(`${this.loc}.valueFrom`, val);
        this.valueFrom.setValidationCallback((err: Validation) => {
            this.updateValidity(err);
        });
    }

    serialize(): CommandLineBinding {
        const serialized: CommandLineBinding = <CommandLineBinding> {};

        this.serializedKeys.forEach(key => {
            if (this[key] !== undefined && key !== "valueFrom") {
                serialized[key] = this[key];
            }
        });

        if (this.valueFrom !== undefined) serialized.valueFrom = this.valueFrom.serialize();

        return Object.assign(serialized, this.customProps);
    }

    deserialize(binding: CommandLineBinding): void {
        this.position      = binding.position;
        this.prefix        = binding.prefix;
        this.separate      = binding.separate;
        this.itemSeparator = binding.itemSeparator;
        this.valueFrom     = binding.valueFrom !== undefined ? new ExpressionModel(`${this.loc}.valueFrom`, binding.valueFrom) : undefined;

        if (this.valueFrom) {
            this.valueFrom.setValidationCallback((err: Validation) => this.updateValidity(err));
        }

        // populates object with all custom attributes not covered in model
        Object.keys(binding).forEach(key => {
            if (this.serializedKeys.indexOf(key) === -1) {
                this.customProps[key] = binding[key];
            }
        });
    }
}