import {CommandOutputParameter} from "../../mappings/d2sb/CommandOutputParameter";
import {CommandOutputBinding} from "../../mappings/d2sb/CommandOutputBinding";
import {Serializable} from "../interfaces/Serializable";
import {TypeResolution, TypeResolver, PrimitiveType} from "../helpers/TypeResolver";
import {ValidationBase} from "../helpers/validation";
import {CommandOutputRecordField} from "../../mappings/v1.0/CommandOutputRecordField";
import {ParameterTypeModel, PrimitiveParameterType} from "./ParameterTypeModel";

export class CommandOutputParameterModel extends ValidationBase implements Serializable<CommandOutputParameter> {
    id: string;
    _type: ParameterTypeModel;
    outputBinding: CommandOutputBinding;
    label: string;
    description: string;

    get isRequired(): boolean {
        return this._type.isRequired;
    }

    set isRequired(r: boolean) {
        this._type.isRequired = r;
    }

    get type(): PrimitiveParameterType {
        return this._type.type;
    }

    set type(t: PrimitiveParameterType) {
        this._type.setType(t);
    }

    get items(): PrimitiveParameterType {
        return this._type.items;
    }

    set items(t: PrimitiveParameterType) {
        this._type.type = "array";
        this._type.items = t;
    }

    get fields(): Array<CommandOutputRecordField> {
        return <Array<CommandOutputRecordField>> this._type.fields;
    }

    constructor(loc: string, attr: CommandOutputParameter) {
        super(loc);
        this.deserialize(attr);
    }

    serialize(): CommandOutputParameter {
        const output: CommandOutputParameter = <CommandOutputParameter>{};

        output.id = this.id;

        if (this.outputBinding) output.outputBinding = this.outputBinding;

        return output;
    }

    deserialize(attr: CommandOutputParameter): void {
        this.id            = attr.id;
        this.outputBinding = attr.outputBinding;
        this._type         = TypeResolver.resolveType(attr.type);
        this.label         = attr.label;
        this.description   = attr.description;
    }

}