import {Serializable} from "../interfaces/Serializable";
import {CommandLineBindingModel} from "../generic/CommandLineBindingModel";
import {CommandLineBinding} from "../../mappings/v1.0/CommandLineBinding";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {Expression} from "../../mappings/v1.0/Expression";
import {spreadAllProps, spreadSelectProps} from "../helpers/utils";
import {EventHub} from "../helpers/EventHub";
import {ErrorCode} from "../helpers/validation/ErrorCode";

export class V1CommandLineBindingModel extends CommandLineBindingModel implements Serializable<CommandLineBinding> {
    public valueFrom: V1ExpressionModel;
    public shellQuote = false;
    public hasSecondaryFiles = false;
    public hasShellQuote     = true;

    constructor(binding?: CommandLineBinding, loc?: string, eventHub?: EventHub) {
        super(loc, eventHub);

        if (binding) this.deserialize(binding);
    }

    private serializedKeys: string[] = [
        "position",
        "prefix",
        "separate",
        "itemSeparator",
        "valueFrom",
        "shellQuote",
        "loadContents"
    ];

    setValueFrom(val: string | Expression) {
        this.valueFrom = new V1ExpressionModel(val, `${this.loc}.valueFrom`, this.eventHub);
        this.valueFrom.setValidationCallback(err => this.updateValidity(err));
    }

    deserialize(binding: CommandLineBinding): void {
        this.position      = !isNaN(binding.position) ? parseInt(<any> binding.position) : 0;
        this.prefix        = binding.prefix;
        this.separate      = binding.separate !== false; // default is true if not specified
        this.itemSeparator = binding.itemSeparator;
        this.shellQuote    = binding.shellQuote || false; // default is true if not specified
        this.loadContents  = binding.loadContents === true;

        this.valueFrom = new V1ExpressionModel(binding.valueFrom, `${this.loc}.valueFrom`, this.eventHub);
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

        if (base.shellQuote !== false) {
            delete base.shellQuote; // true by default
        } else if (base.shellQuote === false && this.eventHub) {
            this.eventHub.emit("binding.shellQuote", true);
        }

        if (base.separate !== false) {
            delete base.separate; // true by default
        }

        if (this.valueFrom.serialize() !== undefined) {
            base.valueFrom = <string | Expression> this.valueFrom.serialize();
        }

        return spreadAllProps(base, this.customProps);
    }

    validate(context): Promise<any> {
        this.clearIssue(ErrorCode.ALL);
        const promises = [];

        promises.push(this.valueFrom.validate(context));

        return Promise.all(promises).then(() => this.issues);
    }
}
