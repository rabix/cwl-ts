import {Serializable} from "../interfaces/Serializable";
import {CommandLineBindingModel} from "../generic/CommandLineBindingModel";
import {CommandLineBinding} from "../../mappings/v1.0/CommandLineBinding";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {Expression} from "../../mappings/v1.0/Expression";
import {spreadAllProps, spreadSelectProps} from "../helpers/utils";

export class V1CommandLineBindingModel extends CommandLineBindingModel implements Serializable<CommandLineBinding> {
    public valueFrom: V1ExpressionModel;
    public hasSecondaryFiles = false;

    constructor(binding?: CommandLineBinding, loc?: string) {
        super(loc);

        if (binding) this.deserialize(binding);
    }

    private serializedKeys: string[] = [
        "position",
        "prefix",
        "separate",
        "itemSeparator",
        "valueFrom",
        "loadContents"
    ];

    setValueFrom(val: string | Expression) {
        this.valueFrom = new V1ExpressionModel(val, `${this.loc}.valueFrom`);
        this.valueFrom.setValidationCallback(err => this.updateValidity(err));
    }

    deserialize(binding: CommandLineBinding): void {
        this.position      = !isNaN(binding.position) ? parseInt(<any> binding.position) : 0;
        this.prefix        = binding.prefix;
        this.separate      = binding.separate;
        this.itemSeparator = binding.itemSeparator;
        this.loadContents  = binding.loadContents === true;

        this.valueFrom = new V1ExpressionModel(binding.valueFrom, `${this.loc}.valueFrom`);
        this.valueFrom.setValidationCallback(err => this.updateValidity(err));

        spreadSelectProps(binding, this.customProps, this.serializedKeys);
    }

    serialize(): any {
        const base: CommandLineBinding = <CommandLineBinding> {};
        this.serializedKeys.forEach(key => {
            if (this[key] !== undefined && this[key] !== null && key !== "valueFrom") {
                base[key] = this[key];
            }
        });

        if (!base.loadContents) delete base.loadContents;

        if (this.valueFrom.serialize() !== undefined) {
            base.valueFrom = <string | Expression> this.valueFrom.serialize();
        }

        return spreadAllProps(base, this.customProps);
    }
}