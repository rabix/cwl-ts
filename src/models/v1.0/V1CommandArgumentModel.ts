import {CommandLineBinding} from "../../mappings/v1.0";
import {Serializable} from "../interfaces/Serializable";
import {CommandArgumentModel} from "../generic/CommandArgumentModel";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {V1CommandLineBindingModel} from "./V1CommandLineBindingModel";
import {EventHub} from "../helpers/EventHub";
import {ErrorCode} from "../helpers/validation/ErrorCode";

export class V1CommandArgumentModel extends CommandArgumentModel implements Serializable<CommandLineBinding
    | string> {

    protected binding: V1CommandLineBindingModel;

    primitive: V1ExpressionModel;
    hasExprPrimitive = true;
    hasShellQuote    = true;

    bindingModel = V1CommandLineBindingModel;

    constructor(arg?: CommandLineBinding | string, loc?: string, eventHub?: EventHub) {
        super(loc, eventHub);

        if (arg) this.deserialize(arg);
    }

    get arg(): string | V1ExpressionModel | CommandLineBinding | V1CommandLineBindingModel {
        return this.primitive || this.binding;
    }

    set arg(value: string | V1ExpressionModel | CommandLineBinding | V1CommandLineBindingModel) {
        this.deserialize(value);
    }

    toggleBinding(state: boolean): void {
        if (state) {
            this.binding   = new this.bindingModel({}, this.loc, this.eventHub);
            this.binding.setValidationCallback(ev => this.updateValidity(ev));
            this.primitive.clearIssue(ErrorCode.ALL);
            this.primitive = undefined;
        } else {
            this.primitive = new V1ExpressionModel("", this.loc, this.eventHub);
            this.primitive.setValidationCallback(ev => this.updateValidity(ev));
            this.binding.clearIssue(ErrorCode.ALL);
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
        this.binding.position      =  !isNaN(<any> binding.position) ? parseInt(<any> binding.position): 0;
        this.binding.separate      = binding.separate;
        this.binding.itemSeparator = binding.itemSeparator;
        this.binding.shellQuote    = binding.shellQuote;
        this.binding.valueFrom = new V1ExpressionModel(binding.valueFrom, `${this.loc}.valueFrom`, this.eventHub);
        this.binding.valueFrom.setValidationCallback(err => this.updateValidity(err));

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

    deserialize(attr: string | V1ExpressionModel | CommandLineBinding | V1CommandLineBindingModel): void {
        if (typeof attr === 'string' || attr instanceof V1ExpressionModel) {
            this.hasBinding = false;
            this.primitive  = new V1ExpressionModel(attr, this.loc, this.eventHub);
            this.primitive.setValidationCallback(err => this.updateValidity(err));
        } else if (attr instanceof this.bindingModel) {
            this.hasBinding = true;
            this.binding    = new this.bindingModel(attr.serialize(), this.loc, this.eventHub);
            this.binding.setValidationCallback(err => this.updateValidity(err));
        } else if (typeof attr === 'object') {
            this.hasBinding = true;
            this.binding    = new this.bindingModel(attr, this.loc, this.eventHub);
            this.binding.setValidationCallback(err => this.updateValidity(err));
        }
    }


}
