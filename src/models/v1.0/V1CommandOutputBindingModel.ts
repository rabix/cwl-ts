import {CommandOutputBindingModel} from "../generic/CommandOutputBindingModel";
import {CommandOutputBinding} from "../../mappings/v1.0/CommandOutputBinding";
import {V1ExpressionModel} from "./V1ExpressionModel";
export class V1CommandOutputBindingModel extends CommandOutputBindingModel {

    public hasSecondaryFiles  = false;
    public hasMetadata        = false;
    public hasInheritMetadata = false;

    private _glob: V1ExpressionModel;

    get glob(): V1ExpressionModel {
        return this._glob;
    }

    set glob(value: V1ExpressionModel) {
        this._glob = value;
        this._glob.loc = `${this.loc}.glob`;
        this._glob.setValidationCallback(err => this.updateValidity(err));
    }

    outputEval: V1ExpressionModel;

    constructor(binding: CommandOutputBinding = {}, loc?: string) {
        super(loc);

        if (binding) this.deserialize(binding);
    }

    public deserialize(binding: CommandOutputBinding) {
        let glob = binding.glob;

        if (Array.isArray(binding.glob)) {
            glob = binding.glob[0];
        }

        this._glob = new V1ExpressionModel(<string> glob, `${this.loc}.glob`);
        this._glob.setValidationCallback(err => this.updateValidity(err));

        this.outputEval = new V1ExpressionModel(binding.outputEval, `${this.loc}.outputEval`);
        this.outputEval.setValidationCallback(err => this.updateValidity(err));
    }

    public serialize(): CommandOutputBinding {
        let base: CommandOutputBinding = <CommandOutputBinding> {};

        if (this._glob && this._glob.serialize() !== undefined) base.glob = this._glob.serialize();
        if (this.outputEval && this.outputEval.serialize() !== undefined) base.outputEval = this.outputEval.serialize();

        return base;
    }
}