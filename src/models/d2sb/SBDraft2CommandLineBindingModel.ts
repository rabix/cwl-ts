import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {Expression} from "../../mappings/d2sb/Expression";
import {CommandLineBindingModel} from "../generic/CommandLineBindingModel";
import {spreadAllProps, spreadSelectProps} from "../helpers/utils";
import {Serializable} from "../interfaces/Serializable";
import {SBDraft2ExpressionModel} from "./SBDraft2ExpressionModel";
import * as ts from "typescript-json-schema/typings/typescript/typescript";
import warning = ts.ScriptElementKind.warning;

export class SBDraft2CommandLineBindingModel extends CommandLineBindingModel implements Serializable<CommandLineBinding> {
    public valueFrom: SBDraft2ExpressionModel;
    public hasSecondaryFiles = true;
    protected context: { $job: any, $self: any };

    private serializedKeys: string[] = [
        "position",
        "prefix",
        "separate",
        "itemSeparator",
        "valueFrom",
        "loadContents",
        "secondaryFiles"
    ];

    constructor(binding?: CommandLineBinding, loc?: string) {
        super(loc);
        this.deserialize(binding || {});
    }

    setValueFrom(val: string | Expression) {
        this.valueFrom = new SBDraft2ExpressionModel(val, `${this.loc}.valueFrom`);
        this.valueFrom.setValidationCallback((err) => {
            this.updateValidity(err);
        });
    }

    public validate(context: {$job: any, $self: any}): Promise<any> {
        const promises = [];
        this.cleanValidity();

        if (this.valueFrom) {
            promises.push(this.valueFrom.validate(context));
        }

        return Promise.all(promises).then(() => this.issues, (ex) => {
            console.warn(`SBDraft2CommandLineBindingModel threw error in validation: ${ex}`);
            return this.issues;
        })
    }

    serialize(): CommandLineBinding {
        const base: CommandLineBinding = <CommandLineBinding> {};

        this.serializedKeys.forEach(key => {
            if (this[key] !== undefined && this[key] !== null && key !== "valueFrom" && key !== "secondaryFiles") {
                base[key] = this[key];
            }
        });

        if (!base.loadContents) delete base.loadContents;

        if (this.valueFrom.serialize() !== undefined) {
            base.valueFrom = <string | Expression> this.valueFrom.serialize();
        }

        return spreadAllProps(base, this.customProps);
    }

    deserialize(binding: CommandLineBinding): void {
        if (binding && binding.constructor === Object) {
            this.position      = !isNaN(binding.position) ? parseInt(<any> binding.position) : 0;
            this.prefix        = binding.prefix;
            this.separate      = binding.separate;
            this.itemSeparator = binding.itemSeparator;
            this.loadContents  = binding.loadContents === true;

            this.valueFrom = new SBDraft2ExpressionModel(binding.valueFrom, `${this.loc}.valueFrom`);
            this.valueFrom.setValidationCallback(err => this.updateValidity(err));

            // populates object with all custom attributes not covered in model
            spreadSelectProps(binding, this.customProps, this.serializedKeys);
        }
    }

}