import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {CommandLineBindingModel} from "./CommandLineBindingModel";
import {Validation} from "../helpers/validation/Validation";
import {ExpressionModel} from "./ExpressionModel";

export class CommandArgumentModel extends ValidationBase implements Serializable<string | CommandLineBinding> {
    get prefix(): string {
        return this.binding.prefix;
    }

    get position(): number {
        return this.binding ? this.binding.position || 0 : 0;
    }

    get separate(): boolean {
        return this.binding ? this.binding.separate !== false : true;
    }

    get itemSeparator(): string {
        return this.binding ? this.binding.itemSeparator : undefined;
    }

    get valueFrom(): ExpressionModel {
        return this.binding ? this.binding.valueFrom : undefined;
    }

    public updateBinding(binding: CommandLineBindingModel) {
        this.binding = binding;
        this.binding.setValidationCallback(err => {
            this.updateValidity(err);
        });
        this.binding.loc = `${this.loc}`;
    }

    get arg(): string|CommandLineBinding|CommandLineBindingModel {
        return this.stringVal || this.binding;
    }

    set arg(value: string|CommandLineBinding|CommandLineBindingModel) {
        this.deserialize(value);
    }

    private stringVal: string;
    private binding: CommandLineBindingModel;

    constructor(arg?: string | CommandLineBinding, loc?: string) {
        super(loc);
        this.deserialize(arg || {});
    }

    public customProps: any = {};

    toString(): string {
        if (this.stringVal) return this.stringVal;

        if (this.binding) {
            return this.binding.valueFrom.toString();
        }

        return "";
    }

    serialize(): string|CommandLineBinding {
        if (this.stringVal) {
            return this.stringVal;
        } else {
            return this.binding.serialize();
        }
    }

    deserialize(attr: string|CommandLineBinding|CommandLineBindingModel): void {
        if (typeof attr === "string") {
            this.stringVal = attr;
        } else if (attr instanceof CommandLineBindingModel) {
            this.binding = new CommandLineBindingModel(attr.serialize(), this.loc);
            this.binding.setValidationCallback((err:Validation) => {this.updateValidity(err);})
        } else {
            this.binding = new CommandLineBindingModel(<CommandLineBinding> attr, this.loc);
            this.binding.setValidationCallback((err:Validation) => {this.updateValidity(err);})
        }
    }
}