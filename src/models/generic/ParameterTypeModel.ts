import {Serializable} from "../interfaces/Serializable";
import {TypeResolver, TypeResolution} from "../helpers/TypeResolver";
import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {ValidationBase} from "../helpers/validation/ValidationBase";
import {CommandOutputParameterType as SBDraft2CommandOutputParameterType} from "../../mappings/d2sb/CommandOutputParameter";
import {CommandInputParameterType as SBDraft2CommandInputParameterType} from "../../mappings/d2sb/CommandInputParameter";

import {CommandOutputParameterType as V1CommandOutputParameterType} from "../../mappings/v1.0/CommandOutputParameter";
import {CommandInputParameterType as V1CommandInputParameterType} from "../../mappings/v1.0/CommandInputParameter";

import {spreadSelectProps} from "../helpers/utils";
import {EventHub} from "../helpers/EventHub";

export type PrimitiveParameterType =
    "array"
    | "enum"
    | "record"
    | "File"
    | "string"
    | "int"
    | "float"
    | "null"
    | "boolean"
    | "long"
    | "double"
    | "bytes"
    | "map";

export class ParameterTypeModel extends ValidationBase implements Serializable<any>, TypeResolution {
    public customProps: any = {};

    public hasDirectoryType = false;

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

            if (this.eventHub) {
                this.eventHub.emit("io.change.type", this.loc);
            }
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

        if (this.eventHub) {
            this.eventHub.emit("io.change.type", this.loc);
        }
    }

    public isNullable: boolean             = false;
    public isItemOrArray: boolean          = false;
    public typeBinding: CommandLineBinding = null;
    public fields: Array<any>              = null;
    public symbols: string[]               = null;
    public name: string                    = null;
    private fieldConstructor;
    private eventHub: EventHub;

    constructor(type: SBDraft2CommandInputParameterType |
        SBDraft2CommandOutputParameterType |
        V1CommandOutputParameterType |
        V1CommandInputParameterType, fieldConstructor?, loc?: string, eventHub?: EventHub) {
        super(loc);
        this.fieldConstructor = fieldConstructor;
        this.eventHub         = eventHub;
        this.deserialize(type);
    }

    validate(): Promise<any> {
        let val = {errors: [], warnings: []};
        this.cleanValidity();

        // check type
        // if array, has items. Does not have symbols or items
        if (this.type === "array") {
            if (this.items === null) {
                this.updateValidity({
                    [this.loc]: {
                        type: "error",
                        message: "Type array must have items",
                    }
                });
            }
            if (this.symbols && this.items !== "enum") {
                this.updateValidity({
                    [`${this.loc}.symbols`]: {
                        type: "error",
                        message: "Type array must not have symbols",
                    }
                });
            }
            if (this.fields && this.items !== "record") {
                this.updateValidity({
                    [`${this.loc}.fields`]: {
                        type: "error",
                        message: "Type array must not have fields",
                    }
                });
            }
        }
        // if enum, has symbols. Does not have items or fields. Has name.
        if (this.type === "enum") {
            if (this.items) {

                this.updateValidity({
                    [`${this.loc}.items`]: {
                        type: "error",
                        message: "Type enum must not have items",
                    }
                });
            }
            if (!this.symbols) {
                this.updateValidity({
                    [this.loc]: {
                        type: "error",
                        message: "Type enum must have symbols",
                    }
                });
            }
            if (this.fields) {
                this.updateValidity({
                    [`${this.loc}.fields`]: {
                        type: "error",
                        message: "Type enum must not have fields",
                    }
                });
            }

            if (!this.name) {
                this.updateValidity({
                    [`${this.loc}`]: {
                        type: "error",
                        message: "Type enum must have a name",
                    }
                });
            }
        }
        // if record, has fields. Does not have items or symbols. Has name.
        if (this.type === "record") {
            if (this.items) {

                this.updateValidity({
                    [`${this.loc}.items`]: {
                        type: "error",
                        message: "Type record must not have items",
                    }
                });
            }
            if (this.symbols) {

                this.updateValidity({
                    [`${this.loc}.symbols`]: {
                        type: "error",
                        message: "Type record must not have symbols",
                    }
                });
            }
            if (!this.fields) {
                this.updateValidity({
                    [`${this.loc}`]: {
                        type: "error",
                        message: "Type record must have fields",
                    }
                });
            } else {
                // check validity for each field.
                // @todo check uniqueness of each field name
            }

            if (!this.name) {
                this.updateValidity({
                    [`${this.loc}.type`]: {
                        type: "error",
                        message: "Type record must have a name"
                    }
                });
            }
        }

        return new Promise(res => {
            res(this.issues);
        });
    }

    serialize(version?: "v1.0" | "draft-2"): any {
        let type = TypeResolver.serializeType(this, version);

        if (typeof type === "object" && !Array.isArray(type) && version !== "v1.0") {
            type = {...{}, ...type, ...this.customProps};
        }

        return type
    }

    deserialize(attr: any): void {
        const serializedKeys = ["type", "name", "symbols", "fields", "items", "inputBinding", "outputBinding"];

        TypeResolver.resolveType(attr, this);

        // populates object with all custom attributes not covered in model
        if (typeof attr === "object" && attr !== null && !Array.isArray(attr)) {
            spreadSelectProps(attr, this.customProps, serializedKeys);
        }

        if (this.fields) {
            this.fields = this.fields.map((field, index) => {
                const f = new this.fieldConstructor(field, `${this.loc}.fields[${index}]`);
                f.setValidationCallback((err) => {
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

    addField(field?: any): any {
        if (this.type !== "record" && this.items !== "record") {
            throw(`Fields can only be added to type or items record: type is ${this.type}, items is ${this.items}.`);
        } else {
            const duplicate = this.fields.filter(val => {
                return val.id === field.name
                    || val.id === field.id;
            });

            if (duplicate.length > 0) {
                this.updateValidity({
                    [this.loc]: {
                        message: `Field with name "${duplicate[0].id}" already exists`,
                        type: "error"
                    }
                });
            }

            if (field instanceof this.fieldConstructor) {
                field.loc = `${this.loc}.fields[${this.fields.length}]`;
                field.setValidationCallback((err) => {
                    this.updateValidity(err)
                });

                this.fields.push(field);
                return field;
            } else {
                const f = new this.fieldConstructor(field, `${this.loc}.fields[${this.fields.length}]`);
                f.setValidationCallback((err) => {
                    this.updateValidity(err)
                });

                this.fields.push(f);
                return f;
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