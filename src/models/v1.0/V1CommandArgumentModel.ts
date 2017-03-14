import {CommandLineBinding} from "../../mappings/v1.0";
import {Serializable} from "../interfaces/Serializable";
import {CommandArgumentModel} from "../generic/CommandArgumentModel";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {V1CommandLineBindingModel} from "./V1CommandLineBindingModel";

export class V1CommandArgumentModel extends CommandArgumentModel implements Serializable<
    CommandLineBinding
    | string> {
    private primitiveVal: V1ExpressionModel;

    constructor(arg?: CommandLineBinding | string, loc?: string) {
        super(loc);

        if (arg) this.deserialize(arg);
    }

    get arg(): string | CommandLineBinding | V1CommandLineBindingModel {
        return this.primitiveVal ? this.primitiveVal.serialize() : this.binding;
    }

    set arg(value: string | CommandLineBinding | V1CommandLineBindingModel) {
        this.deserialize(value);
    }

    serialize(): CommandLineBinding | string {
        if (this.binding) {
            return this.binding.serialize();
        }

        if (this.primitiveVal) {
            return this.primitiveVal.serialize();
        }

        return "";
    }

    deserialize(attr: string | CommandLineBinding | V1CommandLineBindingModel): void {
        if (typeof attr === 'string') {
            this.primitiveVal = new V1ExpressionModel(attr, this.loc);
            this.primitiveVal.setValidationCallback(err => this.updateValidity(err));
        } else if (attr instanceof V1CommandLineBindingModel) {
            this.binding = new V1CommandLineBindingModel(attr.serialize());
            this.binding.setValidationCallback(err => this.updateValidity(err));
        } else if (typeof attr === 'object') {
            this.binding = new V1CommandLineBindingModel(attr, this.loc);
            this.binding.setValidationCallback(err => this.updateValidity(err));
        }
    }
}