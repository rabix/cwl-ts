import {Serializable} from "../interfaces/Serializable";
import {TypeResolver, TypeResolution} from "../helpers/TypeResolver";
import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {ValidationBase} from "../helpers/validation/ValidationBase";
import {CommandOutputParameterType} from "../../mappings/d2sb/CommandOutputParameter";
import {CommandInputParameterType} from "../../mappings/d2sb/CommandInputParameter";
import {Validation} from "../helpers/validation/Validation";

export type PrimitiveParameterType = "array" | "enum" | "record" | "File" | "string" | "int" | "float" | "null" | "boolean" | "long" | "double" | "bytes" | "map";

export abstract class ParameterTypeModel extends ValidationBase implements Serializable<any>, TypeResolution {
    public customProps: any = {};

    private _items: PrimitiveParameterType = null;

    get items(): PrimitiveParameterType {
        return this._items;
    }

    set items(t: PrimitiveParameterType) {
        if (t && this._type !== "array") {
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
                this._items  = null;
                this.fields  = null;
                this.symbols = this.symbols || [];
                break;
            case "record":
                this._items  = null;
                this.symbols = null;
                this.fields  = this.fields || [];
                break;
            default:
                this._items  = null;
                this.symbols = null;
                this.fields  = null;
        }
    }

    isNullable: boolean = false;
    typeBinding: CommandLineBinding = null;
    fields: Array<any> = null;
    symbols: string[] = null;
    name: string = null;

    constructor(type: CommandInputParameterType | CommandOutputParameterType, loc: string) {
        super(loc);
        this.deserialize(type);
    }

    validate(): Validation {
        let val = {errors: [], warnings: []};

        // check type
        // if array, has items. Does not have symbols or items
        if (this.type === "array") {
            if (this.items === null) {
                val.errors.push({
                    message: "Type array must have items",
                    loc: `${this.loc}`
                });
            }
            if (this.symbols) {
                val.errors.push({
                    message: "Type array must not have symbols",
                    loc: `${this.loc}.symbols`
                });
            }
            if (this.fields) {
                val.errors.push({
                    message: "Type array must not have fields",
                    loc: `${this.loc}.fields`
                });
            }
        }
        // if enum, has symbols. Does not have items or fields. Has name.
        if (this.type === "enum") {
            if (this.items) {
                val.errors.push({
                    message: "Type enum must not have items",
                    loc: `${this.loc}.items`
                });
            }
            if (!this.symbols) {
                val.errors.push({
                    message: "Type enum must have symbols",
                    loc: `${this.loc}`
                });
            }
            if (this.fields) {
                val.errors.push({
                    message: "Type enum must not have fields",
                    loc: `${this.loc}.fields`
                });
            }

            if (!this.name) {
                val.errors.push({
                    message: "Type enum must have a name",
                    loc: `${this.loc}`
                });
            }
        }
        // if record, has fields. Does not have items or symbols. Has name.
        if (this.type === "record") {
            if (this.items) {
                val.errors.push({
                    message: "Type record must not have items",
                    loc: `${this.loc}.items`
                });
            }
            if (this.symbols) {
                val.errors.push({
                    message: "Type record must not have symbols",
                    loc: `${this.loc}.symbols`
                });
            }
            if (this.fields) {
                val.errors.push({
                    message: "Type record must have fields",
                    loc: `${this.loc}`
                });
            } else {
                // check validity for each field.
                // @todo check uniqueness of each field name
            }

            if (!this.name) {
                val.errors.push({
                    message: "Type record must have a name",
                    loc: `${this.loc}.type`
                });
            }
        }

        this.validation = val;
        return val;
    }

    serialize(): any {
        let type = TypeResolver.serializeType(this);

        if (typeof type === "object" && !Array.isArray(type)) {
            type = Object.assign({}, type, this.customProps);
        }

        return type
    }

    deserialize(attr: any): void {
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
                this._items  = null;
                this.symbols = null;
                break;
        }
    }
}