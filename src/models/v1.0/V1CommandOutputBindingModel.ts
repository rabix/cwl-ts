import {CommandOutputBindingModel} from "../generic/CommandOutputBindingModel";
import {CommandOutputBinding} from "../../mappings/v1.0/CommandOutputBinding";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {EventHub} from "../helpers/EventHub";
export class V1CommandOutputBindingModel extends CommandOutputBindingModel {
    public hasSecondaryFiles  = false;
    public hasMetadata        = false;
    public hasInheritMetadata = false;

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
            });
        }
    }

    protected _outputEval: V1ExpressionModel;

    get outputEval(): V1ExpressionModel {
        return this._outputEval;
    }

    set outputEval(value: V1ExpressionModel) {
        this._outputEval = new V1ExpressionModel(value.serialize(), `${this.loc}.outputEval`, this.eventHub);
        this._outputEval.setValidationCallback(err => this.updateValidity(err));
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

        this._glob = new V1ExpressionModel(<string> glob, `${this.loc}.glob`, this.eventHub);
        this._glob.setValidationCallback(err => this.updateValidity(err));

        this._outputEval = new V1ExpressionModel(binding.outputEval, `${this.loc}.outputEval`, this.eventHub);
        this._outputEval.setValidationCallback(err => this.updateValidity(err));
    }

    public serialize(): CommandOutputBinding {
        let base: CommandOutputBinding = <CommandOutputBinding> {};

        if (this._glob && this._glob.serialize() !== undefined) base.glob = this._glob.serialize();
        if (this._outputEval && this._outputEval.serialize() !== undefined) base.outputEval = this._outputEval.serialize();

        return base;
    }
}