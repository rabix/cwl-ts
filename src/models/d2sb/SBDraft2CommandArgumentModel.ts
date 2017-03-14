import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {Serializable} from "../interfaces/Serializable";
import {SBDraft2CommandLineBindingModel} from "./SBDraft2CommandLineBindingModel";
import {Validation} from "../helpers/validation/Validation";
import {CommandArgumentModel} from "../generic/CommandArgumentModel";

export class SBDraft2CommandArgumentModel extends CommandArgumentModel implements Serializable<
    string
    | CommandLineBinding> {

    public updateBinding(binding: SBDraft2CommandLineBindingModel) {
        this.binding = binding;
        this.binding.setValidationCallback(err => {
            this.updateValidity(err);
        });
        this.binding.loc = `${this.loc}`;
    }

    get arg(): string | CommandLineBinding | SBDraft2CommandLineBindingModel {
        return this.stringVal || this.binding;
    }

    set arg(value: string | CommandLineBinding | SBDraft2CommandLineBindingModel) {
        this.deserialize(value);
    }

    private stringVal: string;
    protected binding: SBDraft2CommandLineBindingModel;

    constructor(arg?: string | CommandLineBinding, loc?: string) {
        super(loc);
        this.deserialize(arg || {});
    }

    toString(): string {
        if (this.stringVal) return this.stringVal;

        if (this.binding) {
            return this.binding.valueFrom.toString();
        }

        return "";
    }

    serialize(): string | CommandLineBinding {
        if (this.stringVal) {
            return this.stringVal;
        } else {
            return this.binding.serialize();
        }
    }

    deserialize(attr: string | CommandLineBinding | SBDraft2CommandLineBindingModel): void {
        if (typeof attr === "string") {
            this.stringVal = attr;
        } else if (attr instanceof SBDraft2CommandLineBindingModel) {
            this.binding = new SBDraft2CommandLineBindingModel(attr.serialize(), this.loc);
            this.binding.setValidationCallback((err: Validation) => {
                this.updateValidity(err);
            })
        } else {
            this.binding = new SBDraft2CommandLineBindingModel(<CommandLineBinding> attr, this.loc);
            this.binding.setValidationCallback((err: Validation) => {
                this.updateValidity(err);
            })
        }
    }
}