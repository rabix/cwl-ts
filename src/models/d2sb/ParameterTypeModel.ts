import {Serializable} from "../interfaces/Serializable";
import {TypeResolver, TypeResolution} from "../helpers/TypeResolver";
import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {ValidationBase} from "../helpers/validation/ValidationBase";
import {CommandOutputParameterType} from "../../mappings/d2sb/CommandOutputParameter";
import {CommandInputParameterType} from "../../mappings/d2sb/CommandInputParameter";

export type PrimitiveParameterType = "array" | "enum" | "record" | "File" | "string" | "int" | "float" | "null" | "boolean" | "long" | "double" | "bytes";

export abstract class ParameterTypeModel extends ValidationBase implements Serializable<any>, TypeResolution {
    public customProps: any = {};

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
    fields: Array<any>;
    symbols: string[];
    name: string;

    constructor(loc: string, type: CommandInputParameterType | CommandOutputParameterType) {
        super(loc);
        this.deserialize(type);
    }

    serialize(): any {
        let type  = TypeResolver.serializeType(this);

        if (typeof type === "object" && !Array.isArray(type)) {
            type = Object.assign({}, type, this.customProps);
        }

        return type
    }

    deserialize(attr: any ): void {
        const serializedKeys = ["type", "name", "symbols", "fields", "items", "inputBinding", "outputBinding"];

        TypeResolver.resolveType(attr, this);

        // populates object with all custom attributes not covered in model
        if (typeof attr === "object") {
            Object.keys(attr).forEach(key => {
                if (serializedKeys.indexOf(key) === -1) {
                    this.customProps[key] = attr[key];
                }
            });
        }
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