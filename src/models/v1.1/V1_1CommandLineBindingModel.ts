import {ExpressionModel} from "../generic/ExpressionModel";
import {CommandLineBinding} from "../../mappings/v1.0/CommandLineBinding";
import {Expression} from "../../mappings/v1.0/Expression";
import {V1CommandLineBindingModel} from "../v1.0/V1CommandLineBindingModel";
import {V1ExpressionModel} from "../v1.0/V1ExpressionModel";

export class V1_1CommandLineBindingModel extends V1CommandLineBindingModel {

    position: V1ExpressionModel;

    setPosition(val: any) {

        val = (val instanceof ExpressionModel) ? (val.serialize() || 0) : val;

        val = val || ~~val;

        if (!this.position || !(this.position instanceof ExpressionModel)) {
            this.position = new V1ExpressionModel(val.toString(), `${this.loc}.position`, this.eventHub);
            this.position.setValidationCallback(err => this.updateValidity(err));
        } else {
            this.position.setValue(val);
        }

    }

    deserialize(binding: CommandLineBinding): void {

        super.deserialize(binding);
        this.setPosition(binding.position);

    }

    serialize(): any {

        const base = super.serialize();

        base.position = <number | Expression>this.position.serialize() || 0;
        base.position = isNaN( base.position) ? base.position : parseInt(base.position, 10);

        return base;

    }

}
