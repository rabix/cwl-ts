import {CommandLineBinding} from "../../mappings/v1.0";
import {V1CommandArgumentModel} from "../v1.0/V1CommandArgumentModel";
import {V1_1CommandLineBindingModel} from "./V1_1CommandLineBindingModel";
import {V1ExpressionModel} from "../v1.0/V1ExpressionModel";
import {EventHub} from "../helpers/EventHub";

export class V1_1CommandArgumentModel extends V1CommandArgumentModel {

    protected binding: V1_1CommandLineBindingModel;

    bindingModel = V1_1CommandLineBindingModel;

    position: V1ExpressionModel;

    constructor(arg?: CommandLineBinding | string, loc?: string, eventHub?: EventHub) {
        super(null, loc, eventHub);

        if (arg) {
            this.deserialize(arg);
        }

    }

    updateBinding(binding: CommandLineBinding) {
        super.updateBinding(binding);

        this.binding.setPosition(binding.position);
    }

    deserialize(attr: string | V1ExpressionModel | CommandLineBinding | V1_1CommandLineBindingModel): void {
        super.deserialize(attr);
    }

}
