import {CommandOutputParameter} from "../../mappings/d2sb/CommandOutputParameter";
import {CommandOutputBinding} from "../../mappings/d2sb/CommandOutputBinding";
import {Serializable} from "../interfaces/Serializable";
import {ValidationBase} from "../helpers/validation";
import {OutputParameterTypeModel} from "./OutputParameterTypeModel";

export class CommandOutputParameterModel extends ValidationBase implements Serializable<CommandOutputParameter> {
    customProps: any;

    id: string;
    type: OutputParameterTypeModel;
    outputBinding: CommandOutputBinding;
    label: string;
    description: string;


    constructor(loc: string, output: CommandOutputParameter) {
        super(loc);
        this.deserialize(output);
    }

    serialize(): CommandOutputParameter {
        let base: any = {};
        base = Object.assign({}, base, this.customProps);

        base.type = this.type.serialize();

        if (this.label) base.label = this.label;
        if (this.description) base.description = this.description;
        if (this.outputBinding) base.outputBinding = this.outputBinding;

        base.id = this.id;

        return base;
    }

    deserialize(attr: CommandOutputParameter): void {
        const serializedAttr = ["id", "label", "description", "outputBinding", "type"];

        this.id            = attr.id;
        this.outputBinding = attr.outputBinding;
        this.label         = attr.label;
        this.description   = attr.description;

        this.type = new OutputParameterTypeModel(attr.type, `${this.loc}.type`);

        Object.keys(attr).forEach(key => {
            if (serializedAttr.indexOf(key) === -1) {
                this.customProps[key] = attr[key];
            }
        });
    }

}