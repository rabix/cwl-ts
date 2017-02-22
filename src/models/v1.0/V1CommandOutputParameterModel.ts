import {CommandOutputBinding, CommandOutputParameter, Expression} from "../../mappings/v1.0";
import {CommandOutputParameterModel} from "../generic/CommandOutputParameterModel";
import {Serializable} from "../interfaces/Serializable";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {commaSeparatedToArray} from "../helpers/utils";

export class V1CommandOutputParameterModel extends CommandOutputParameterModel implements Serializable<CommandOutputParameter> {
    type: ParameterTypeModel;
    label: string;
    outputBinding: CommandOutputBinding;
    description: string;
    secondaryFiles: string|Expression|Array<string|Expression>;
    format: string|Array<string>|Expression;
    streamable: boolean;
    id: string;

    constructor(attr: any, loc?: string) {
        super(loc);

        this.id             = attr.id;
        this.type           = new ParameterTypeModel(attr.type, V1CommandOutputParameterModel, `${this.loc}.type`);
        this.outputBinding  = attr.outputBinding;
        this.label          = attr.label;
        this.description    = attr.description;
        this.secondaryFiles = attr.secondaryFiles;
        this.fileTypes         = commaSeparatedToArray(attr.format);
        this.streamable     = attr.streamable;
    }

    customProps: any = {};

    serialize(): CommandOutputParameter {
        return undefined;
    }

    deserialize(attr: CommandOutputParameter): void {
    }
}