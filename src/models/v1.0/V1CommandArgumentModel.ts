import {CommandLineBinding} from "../../mappings/v1.0";
import {Serializable} from "../interfaces/Serializable";
import {CommandArgumentModel} from "../generic/CommandArgumentModel";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {V1CommandLineBindingModel} from "./V1CommandLineBindingModel";

export class V1CommandArgumentModel extends CommandArgumentModel implements Serializable<CommandLineBinding
    | string> {

    protected binding: V1CommandLineBindingModel;

    primitive: V1ExpressionModel;
    hasExprPrimitive = true;
    hasShellQuote = true;

    constructor(arg?: CommandLineBinding | string, loc?: string) {
        super(loc);

        if (arg) this.deserialize(arg);
    }

    get arg(): string | CommandLineBinding | V1CommandLineBindingModel {
        return this.primitive || this.binding;
    }

    set arg(value: string | CommandLineBinding | V1CommandLineBindingModel) {
        this.deserialize(value);
    }

    toggleBinding(state: boolean): void {
        if (state) {
            this.binding   = new V1CommandLineBindingModel({}, this.loc);
            this.primitive = undefined;
        } else {
            this.primitive = new V1ExpressionModel("", this.loc);
            this.binding   = undefined;
        }

        this.hasBinding = state;
    }

    updatePrimitive(str: string): any {
        this.hasBinding = false;
        this.binding    = undefined;

        this.primitive.setValue(str);
    }

    updateBinding(binding: CommandLineBinding) {
        this.binding.prefix        = binding.prefix;
        this.binding.position      = binding.position;
        this.binding.separate      = binding.separate;
        this.binding.itemSeparator = binding.itemSeparator;
        this.binding.shellQuote    = binding.shellQuote;

        this.primitive  = undefined;
        this.hasBinding = true;
    }

    serialize(): CommandLineBinding | string {
        if (this.binding) {
            return this.binding.serialize();
        }

        if (this.primitive) {
            return this.primitive.serialize();
        }

        return "";
    }

    toString(): string {
        if (this.primitive) return this.primitive.serialize();

        if (this.binding) {
            return this.binding.valueFrom.toString();
        }
    }

    deserialize(attr: string | CommandLineBinding | V1CommandLineBindingModel): void {
        if (typeof attr === 'string') {
            this.hasBinding = false;
            this.primitive  = new V1ExpressionModel(attr, this.loc);
            this.primitive.setValidationCallback(err => this.updateValidity(err));
        } else if (attr instanceof V1CommandLineBindingModel) {
            this.hasBinding = true;
            this.binding    = new V1CommandLineBindingModel(attr.serialize());
            this.binding.setValidationCallback(err => this.updateValidity(err));
        } else if (typeof attr === 'object') {
            this.hasBinding = true;
            this.binding    = new V1CommandLineBindingModel(attr, this.loc);
            this.binding.setValidationCallback(err => this.updateValidity(err));
        }
    }
}