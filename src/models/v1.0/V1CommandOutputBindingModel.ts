import {CommandOutputBindingModel} from "../generic/CommandOutputBindingModel";
import {CommandOutputBinding} from "../../mappings/v1.0/CommandOutputBinding";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {EventHub} from "../helpers/EventHub";


export class V1CommandOutputBindingModel extends CommandOutputBindingModel {
    public hasSecondaryFiles  = false;
    public hasMetadata        = false;
    public hasInheritMetadata = true;

    static INHERIT_REGEX = /\${inheritMetadata\(self, inputs.(.*?)\)}/g;
    public inheritMetadataFrom: string;

    protected _glob: V1ExpressionModel;

    get glob(): V1ExpressionModel {
        return this._glob;
    }

    set glob(value: V1ExpressionModel) {
        this._glob = new V1ExpressionModel(value.serialize(), `${this.loc}.glob`, this.eventHub);
        this._glob.setValidationCallback(err => this.updateValidity(err));
        if (this._glob.serialize() === undefined) {
            this._glob.updateValidity({
                [`${this.loc}.glob`]: {
                    message: "Glob should be specified",
                    type: "warning"
                }
            }, true);
        }
    }

    protected _outputEval: V1ExpressionModel;

    get outputEval(): V1ExpressionModel {
        return this._outputEval;
    }

    set outputEval(value: V1ExpressionModel) {
        const serialized = value.serialize();
        if (!(new RegExp(V1CommandOutputBindingModel.INHERIT_REGEX).test(serialized)) && this.inheritMetadataFrom) {
            this.inheritMetadataFrom = null;
        }
        this._outputEval = new V1ExpressionModel(serialized, `${this.loc}.outputEval`, this.eventHub);
        this._outputEval.setValidationCallback(err => this.updateValidity(err));
    }

    setInheritMetadataFrom(inputId: string) {
        let serialized = this._outputEval.serialize();

        // inherit was set
        if (inputId) {
            this.inheritMetadataFrom = inputId;
            this.eventHub.emit("output.metadata.inherit");

            const inheritExpr = `$\{inheritMetadata(self, inputs.${inputId})}`;

            // output eval doesn't exist
            if (serialized === undefined) {
                this._outputEval.setValue(inheritExpr);
            } else {
                // remove existing inherit statements if they exist
                serialized = serialized.replace(new RegExp(V1CommandOutputBindingModel.INHERIT_REGEX), "");

                // output eval exists and is something else
                this._outputEval.setValue((serialized + "\n\n" + inheritExpr).trim());
            }
        } else if (serialized !== undefined) {
            // inherit was removed and should be removed from outputEval
            const newOutputEval = serialized.replace(new RegExp(V1CommandOutputBindingModel.INHERIT_REGEX), "");
            this._outputEval.setValue(newOutputEval || undefined);
            // set inherit to empty value
            this.inheritMetadataFrom = inputId;
        }
    }

    constructor(binding: CommandOutputBinding = {}, loc?: string, eventHub?: EventHub) {
        super(loc, eventHub);

        if (binding) this.deserialize(binding);
    }

    public deserialize(binding: CommandOutputBinding) {
        let glob = binding.glob;

        if (Array.isArray(binding.glob)) {
            glob = binding.glob[0];
        }

        this.loadContents = binding.loadContents === true;

        this._glob = new V1ExpressionModel(<string> glob, `${this.loc}.glob`, this.eventHub);
        this._glob.setValidationCallback(err => this.updateValidity(err));

        this._outputEval = new V1ExpressionModel(binding.outputEval, `${this.loc}.outputEval`, this.eventHub);
        this._outputEval.setValidationCallback(err => this.updateValidity(err));

        // populate inherit metadata if it existsr
        if (binding.outputEval) {
            // only going to look at the first one, should be the only one
            // have to make a new RegExp because otherwise .exec would be called multiple times on the same one
            const matches = new RegExp(V1CommandOutputBindingModel.INHERIT_REGEX).exec(binding.outputEval);
            this.inheritMetadataFrom = matches ? matches[1] : null;
        }
    }

    public serialize(): CommandOutputBinding {
        let base: CommandOutputBinding = <CommandOutputBinding> {};

        if (this.loadContents) base.loadContents = true;

        if (this._glob && this._glob.serialize() !== undefined) base.glob = this._glob.serialize();
        if (this._outputEval && this._outputEval.serialize() !== undefined) base.outputEval = this._outputEval.serialize();

        return base;
    }
}