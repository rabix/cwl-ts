import {CommandOutputRecordField} from "../../mappings/v1.0/CommandOutputRecordField";
import {CommandInputRecordField} from "../../mappings/d2sb/CommandInputRecordField";
import {Serializable} from "../interfaces/Serializable";
import {TypeResolver, TypeResolution} from "../helpers/TypeResolver";
import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {ValidationBase} from "../helpers/validation/ValidationBase";
import {CommandOutputParameterType} from "../../mappings/d2sb/CommandOutputParameter";
import {CommandInputParameterType} from "../../mappings/d2sb/CommandInputParameter";

export type PrimitiveParameterType = "array" | "enum" | "record" | "File" | "string" | "int" | "float" | "null" | "boolean" | "long" | "double" | "bytes";

export abstract class ParameterTypeModel extends ValidationBase implements Serializable<any>, TypeResolution {
    private _items: PrimitiveParameterType;

    get items(): PrimitiveParameterType {
        return this._items;
    }

    set items(t: PrimitiveParameterType) {
        if (this._type !== "array") {
            throw("ParameterTypeModel: Items can only be set to inputs type Array");
        } else {
            this._items = t;
        }
    }

    private _type: PrimitiveParameterType;

    get type(): PrimitiveParameterType {
        return this._type;
    }

    set type(t: PrimitiveParameterType) {
        this._type = t;

        switch (t) {
            case "array":
                this.symbols = null;
                this.fields  = null;
                break;
            case "enum":
                this._items = null;
                this.fields = null;
                break;
            case "record":
                this._items = null;
                this.symbols = null;
                break;
        }
    }

    isNullable: boolean;
    typeBinding: CommandLineBinding;
    fields: Array<CommandInputRecordField>|Array<CommandOutputRecordField>;
    symbols: string[];
    name: string;

    constructor(loc: string, type: CommandInputParameterType | CommandOutputParameterType) {
        super(loc);
        this.deserialize(type);
    }

    serialize(): any {
        return TypeResolver.serializeType(this);
    }

    deserialize(attr: any ): void {
        TypeResolver.resolveType(attr, this);

    }

    setType(t: PrimitiveParameterType): void {
        this._type = t;

        switch (t) {
            case "array":
                this.symbols = null;
                this.fields  = null;
                break;
            case "enum":
                this._items = null;
                this.fields = null;
                break;
            case "record":
                this._items = null;
                this.symbols = null;
                break;
        }
    }
}