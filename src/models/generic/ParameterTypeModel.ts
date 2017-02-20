import {Serializable} from "../interfaces/Serializable";
import {TypeResolver, TypeResolution} from "../helpers/TypeResolver";
import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {ValidationBase} from "../helpers/validation/ValidationBase";
import {CommandOutputParameterType as SBDraft2CommandOutputParameterType} from "../../mappings/d2sb/CommandOutputParameter";
import {CommandInputParameterType as SBDraft2CommandInputParameterType} from "../../mappings/d2sb/CommandInputParameter";

import {CommandOutputParameterType as V1CommandOutputParameterType} from "../../mappings/v1.0/CommandOutputParameter";
import {CommandInputParameterType as V1CommandInputParameterType} from "../../mappings/v1.0/CommandInputParameter";

import {Validation} from "../helpers/validation/Validation";
import {spreadSelectProps} from "../helpers/utils";

export type PrimitiveParameterType = "array" | "enum" | "record" | "File" | "string" | "int" | "float" | "null" | "boolean" | "long" | "double" | "bytes" | "map";

export class ParameterTypeModel extends ValidationBase implements Serializable<any>, TypeResolution {
    public customProps: any = {};

    private _items: PrimitiveParameterType = null;

    get items(): PrimitiveParameterType {
        return this._items;
    }

    set items(t: PrimitiveParameterType) {
        if (t && this._type !== "array") {
            throw("ParameterTypeModel: Items can only be set to inputs type Array");
        } else {
            switch (t) {
                case "enum":
                    this.symbols = [];
                    break;
                case "record":
                    this.fields = [];
                    break;
            }
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

    public isNullable: boolean             = false;
    public typeBinding: CommandLineBinding = null;
    public fields: Array<any>              = null;
    public symbols: string[]               = null;
    public name: string                    = null;
    private fieldConstructor;

    constructor(type: SBDraft2CommandInputParameterType |
        SBDraft2CommandOutputParameterType |
        V1CommandOutputParameterType |
        V1CommandInputParameterType, fieldConstructor?, loc?: string) {
        super(loc);
        this.fieldConstructor = fieldConstructor;
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
            if (this.symbols && this.items !== "enum") {
                val.errors.push({
                    message: "Type array must not have symbols",
                    loc: `${this.loc}.symbols`
                });
            }
            if (this.fields && this.items !== "record") {
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
            if (!this.fields) {
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
            type = { ...{}, ...type, ...this.customProps};
        }

        return type
    }

    deserialize(attr: any): void {
        const serializedKeys = ["type", "name", "symbols", "fields", "items", "inputBinding", "outputBinding"];

        TypeResolver.resolveType(attr, this);

        // populates object with all custom attributes not covered in model
        if (typeof attr === "object" && attr !== null) {
            spreadSelectProps(attr, this.customProps, serializedKeys);
        }

        if (this.fields) {
            this.fields = this.fields.map((field, index) => {
                const f = new this.fieldConstructor(field, `${this.loc}.fields[${index}]`);
                f.setValidationCallback((err: Validation) => {
                    this.updateValidity(err)
                });
                return f;
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

    addField(field: any) {
        if (this.type !== "record" && this.items !== "record") {
            throw(`Fields can only be added to type or items record: type is ${this.type}, items is ${this.items}.`);
        } else {
            const duplicate = this.fields.filter(val => {
                return val.id === field.name
                    || val.id === field.id;
            });

            if (duplicate.length > 0) {
                this.validation.errors.push({
                    loc: this.loc,
                    message: `Field with name "${duplicate[0].id}" already exists`
                });
            }

            if (field instanceof this.fieldConstructor) {
                field.loc = `${this.loc}.fields[${this.fields.length}]`;
                field.setValidationCallback((err: Validation) => {
                    this.updateValidity(err)
                });

                this.fields.push(field);
            } else {
                const f = new this.fieldConstructor(field, `${this.loc}.fields[${this.fields.length}]`);
                f.setValidationCallback((err: Validation) => {
                    this.updateValidity(err)
                });

                this.fields.push(f);
            }
        }
    }

    removeField(field: any) {
        let found;

        if (typeof field === "string") {
            found = this.fields.filter(val => val.id === field)[0];
        } else {
            found = field;
        }

        const index = this.fields.indexOf(found);
        if (index < 0) {
            throw(`Field ${field} does not exist on input`);
        }

        this.fields.splice(index, 1);
    }
}