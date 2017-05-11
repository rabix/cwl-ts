import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {CommandArgumentModel} from "../generic/CommandArgumentModel";
import {Serializable} from "../interfaces/Serializable";
import {SBDraft2CommandLineBindingModel} from "./SBDraft2CommandLineBindingModel";

export class SBDraft2CommandArgumentModel extends CommandArgumentModel implements Serializable<
    string
    | CommandLineBinding> {

    hasExprPrimitive = false;
    primitive: string;

    public updateBinding(binding: CommandLineBinding) {
        this.hasBinding = true;
        this.primitive  = undefined;

        this.binding = new SBDraft2CommandLineBindingModel(binding, this.loc);
        this.binding.setValidationCallback(err => this.updateValidity(err));
    }


    updatePrimitive(str: string) {
        this.hasBinding = false;
        this.binding    = undefined;
        this.primitive  = str;
    }


    toggleBinding(state: boolean): void {
        if (state) {
            this.binding = new SBDraft2CommandLineBindingModel({}, this.loc);
            this.primitive = undefined;
        } else {
            this.primitive = "";
            this.binding = undefined;
        }

        this.hasBinding = state;
    }

    get arg(): string | CommandLineBinding | SBDraft2CommandLineBindingModel {
        return this.primitive || this.binding;
    }

    set arg(value: string | CommandLineBinding | SBDraft2CommandLineBindingModel) {
        this.deserialize(value);
    }

    protected binding: SBDraft2CommandLineBindingModel;

    constructor(arg?: string | CommandLineBinding, loc?: string) {
        super(loc);
        this.deserialize(arg || {});
    }

    toString(): string {
        if (this.primitive) return this.primitive;

        if (this.binding) {
            return this.binding.valueFrom.toString();
        }

        return "";
    }

    serialize(): string | CommandLineBinding {
        if (this.primitive) {
            return this.primitive;
        } else {
            return this.binding.serialize();
        }
    }

    deserialize(attr: string | CommandLineBinding | SBDraft2CommandLineBindingModel): void {
        if (typeof attr === "string") {
            this.hasBinding = false;
            this.primitive  = attr;
        } else if (attr instanceof SBDraft2CommandLineBindingModel) {
            this.hasBinding = true;
            this.binding    = new SBDraft2CommandLineBindingModel(attr.serialize(), this.loc);
            this.binding.setValidationCallback(err => this.updateValidity(err));
        } else {
            this.hasBinding = true;
            this.binding    = new SBDraft2CommandLineBindingModel(<CommandLineBinding> attr, this.loc);
            this.binding.setValidationCallback(err => this.updateValidity(err));
        }
    }
}