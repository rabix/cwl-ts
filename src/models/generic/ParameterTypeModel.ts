import {Serializable} from "../interfaces/Serializable";
import {TypeResolver, TypeResolution} from "../helpers/TypeResolver";
import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {ValidationBase} from "../helpers/validation/ValidationBase";
import {CommandOutputParameterType as SBDraft2CommandOutputParameterType} from "../../mappings/d2sb/CommandOutputParameter";
import {CommandInputParameterType as SBDraft2CommandInputParameterType} from "../../mappings/d2sb/CommandInputParameter";

import {CommandOutputParameterType as V1CommandOutputParameterType} from "../../mappings/v1.0/CommandOutputParameter";
import {CommandInputParameterType as V1CommandInputParameterType} from "../../mappings/v1.0/CommandInputParameter";

import {ensureArray, incrementLastLoc, incrementString, spreadSelectProps} from "../helpers/utils";
import {EventHub} from "../helpers/EventHub";
import {ErrorCode} from "../helpers/validation/ErrorCode";
import {InputBinding} from "../../mappings/v1.0";

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
    | "Directory"
    | "map"
    | "stdin"
    | "any"

export class ParameterTypeModel extends ValidationBase implements Serializable<any>, TypeResolution {
    get symbols(): string[] {
        return this._symbols;
    }

    set symbols(value: string[]) {
        this._symbols = value;
        if (this.eventHub) {
            this.eventHub.emit("io.change.type", this.loc);
        }
    }

    public doc?: string;

    public customProps: any = {};

    public hasDirectoryType = false;

    public hasStdinType = false;

    public hasMapType = false;

    private _items: PrimitiveParameterType = null;

    get items(): PrimitiveParameterType {
        return this._items;
    }

    set items(t: PrimitiveParameterType) {
        if (t && this._type !== "array") {
            throw("ParameterTypeModel: Items can only be set to inputs type Array");
        } else if (t !== undefined && this._items !== t) {
            switch (t) {
                case "enum":
                    this._symbols = [];
                    this.removeAllFields();
                    break;
                case "record":
                    this.fields   = [];
                    this._symbols = null;
                    break;
                default:
                    this._symbols = null;
                    this.removeAllFields();
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
        if (t !== undefined && this._type === t) {
            return;
        }
        this._type = t;

        switch (t) {
            case "array":
                this._symbols = null;
                this.removeAllFields();
                break;
            case "enum":
                this._items   = null;
                this.removeAllFields();
                this._symbols = this._symbols || [];
                break;
            case "record":
                this._items   = null;
                this._symbols = null;
                this.fields   = this.fields || [];
                break;
            default:
                this._items   = null;
                this._symbols = null;
                this.removeAllFields();
        }

        if (this.eventHub) {
            this.eventHub.emit("io.change.type", this.loc);
        }
    }

    public inputBinding: any               = null;
    public isNullable: boolean             = false;
    public isItemOrArray: boolean          = false;
    public typeBinding: CommandLineBinding = null;
    public fields: Array<any>              = null;
    private _symbols: string[]             = null;
    public name: string                    = null;
    public unionType: any                 = null;
    private fieldConstructor;
    private eventHub: EventHub;
    private nameBase                       = "field";

    constructor(type: SBDraft2CommandInputParameterType |
        SBDraft2CommandOutputParameterType |
        V1CommandOutputParameterType |
        V1CommandInputParameterType, fieldConstructor?, nameBase?: string, loc?: string, eventHub?: EventHub) {
        super(loc);
        this.fieldConstructor = fieldConstructor;
        this.eventHub         = eventHub;
        this.nameBase         = nameBase;
        this.deserialize(type);
    }

    validate(context = {}): Promise<any> {
        this.clearIssue(ErrorCode.TYPE_ALL);
        const promises = [];

        // check type
        // if array, has items. Does not have symbols or items
        if (this.type === "array") {
            if (this.items === null) {
                this.setIssue({
                    [this.loc]: {
                        type: "error",
                        message: "Type array must have items",
                        code: ErrorCode.TYPE_ITEMS_MISSING
                    }
                });
            }
            if (this._symbols && this.items !== "enum") {
                this.setIssue({
                    [`${this.loc}.symbols`]: {
                        type: "error",
                        message: "Type array must not have symbols",
                        code: ErrorCode.TYPE_SYMBOLS_MISSING
                    }
                });
            }
            if (this.fields && this.items !== "record") {
                this.setIssue({
                    [`${this.loc}.fields`]: {
                        type: "error",
                        message: "Type array must not have fields",
                        code: ErrorCode.TYPE_FIELDS_MISSING
                    }
                });
            }
        }
        // if enum, has symbols. Does not have items or fields. Has name.
        if (this.type === "enum") {
            if (this.items) {

                this.setIssue({
                    [`${this.loc}.items`]: {
                        type: "error",
                        message: "Type enum must not have items",
                        code: ErrorCode.TYPE_EXTRA_PROPS
                    }
                });
            }
            if (!this._symbols) {
                this.setIssue({
                    [this.loc]: {
                        type: "error",
                        message: "Type enum must have symbols",
                        code: ErrorCode.TYPE_EXTRA_PROPS
                    }
                });
            }
            if (this.fields) {
                this.setIssue({
                    [`${this.loc}.fields`]: {
                        type: "error",
                        message: "Type enum must not have fields",
                        code: ErrorCode.TYPE_EXTRA_PROPS
                    }
                });
            }

            if (!this.name) {
                this.setIssue({
                    [`${this.loc}`]: {
                        type: "error",
                        message: "Type enum must have a name",
                        code: ErrorCode.TYPE_EXTRA_PROPS
                    }
                });
            }
        }
        // if record, has fields. Does not have items or symbols. Has name.
        if (this.type === "record") {
            if (this.items) {

                this.setIssue({
                    [`${this.loc}.items`]: {
                        type: "error",
                        message: "Type record must not have items",
                        code: ErrorCode.TYPE_EXTRA_PROPS
                    }
                });
            }
            if (this._symbols) {
                this.setIssue({
                    [`${this.loc}.symbols`]: {
                        type: "error",
                        message: "Type record must not have symbols",
                        code: ErrorCode.TYPE_EXTRA_PROPS
                    }
                });
            }
            if (!this.fields) {
                this.setIssue({
                    [`${this.loc}`]: {
                        type: "error",
                        message: "Type record must have fields",
                        code: ErrorCode.TYPE_EXTRA_PROPS
                    }
                });
            } else {
                // promises.concat(this.fields.map(field => field.validate(context)));
            }

            if (!this.name) {
                this.setIssue({
                    [`${this.loc}.type`]: {
                        type: "error",
                        message: "Type record must have a name",
                        code: ErrorCode.TYPE_NAME_MISSING
                    }
                });
            }
        }

        return Promise.all(promises).then(res => {
            return this.issues;
        });
    }

    serialize(version?: "v1.1" |"v1.0" | "draft-2"): any {
        let type = TypeResolver.serializeType(this, version);

        if (typeof type === "object" && !Array.isArray(type) && version === "draft-2" && type !== null) {
            type = {...{}, ...type, ...this.customProps};
        }

        if (typeof type === "object" && this.inputBinding && typeof this.inputBinding.serialize === 'function') {
            type.inputBinding = this.inputBinding.serialize();
        }

        return type;
    }

    addInputBinding(binding: InputBinding) {
        this.inputBinding = binding;
        this.inputBinding.setValidationCallback(err => this.updateValidity(err));
    }

    deserialize(attr: any): void {
        const serializedKeys = ["type", "name", "_symbols", "fields", "items", "inputBinding", "outputBinding"];

        try {
            TypeResolver.resolveType(attr, this);
        } catch (ex) {
            this.setIssue({
                [this.loc]: {
                    message: ex.message,
                    type: "error",
                    code: ex.code
                }
            });
        }

        // populates object with all custom attributes not covered in model
        if (typeof attr === "object" && attr !== null && !Array.isArray(attr)) {
            spreadSelectProps(attr, this.customProps, serializedKeys);
        }

        if (this.fields) {
            this.fields = ensureArray(this.fields, "name", "type").map((field, index) => {
                const f   = new this.fieldConstructor(field, `${this.loc}.fields[${index}]`, this.eventHub);
                f.isField = true;
                f.setValidationCallback((err) => this.updateValidity(err));
                return f;
            });
        }

    }

    updateLoc(loc: string) {
        super.updateLoc(loc);

        if (this.fields && this.fields.length) {
            this.fields.forEach((f, i) => f.updateLoc(`${this.loc}.fields[${i}]`));
        }
    }

    setType(t: PrimitiveParameterType): void {
        this._type = t;

        switch (t) {
            case "array":
                this._symbols = null;
                this.removeAllFields();
                break;
            case "enum":
                this._items = null;
                this.removeAllFields();
                break;
            case "record":
                this._items   = null;
                this._symbols = null;
                break;
        }

        if (this.eventHub) {
            this.eventHub.emit("io.change.type", this.loc);
        }
    }

    private getNextAvailableName(id: string) {
        let hasId  = true;
        let result = id;

        const set = this.fields;
        const len = set.length;

        while (hasId) {
            hasId = false;

            // loop through all inputs and outputs to verify id uniqueness
            for (let i = 0; i < len; i++) {
                if (set[i].id === result) {
                    hasId  = true;
                    // if id exists, increment and check the uniqueness of the incremented id
                    result = incrementString(result);
                }
            }
        }

        return result;
    }

    addField(field: any = {}): any {
        if (this.type !== "record" && this.items !== "record") {
            throw new Error(`Fields can only be added to type or items record: type is ${this.type}, items is ${this.items}.`);
        } else {

            if (field.id) {
                const duplicate = this.fields.filter(val => {
                    return val.id === field.name
                        || val.id === field.id;
                });

                if (duplicate.length > 0) {
                    this.setIssue({
                        [this.loc]: {
                            message: `Field with name "${duplicate[0].id}" already exists`,
                            type: "error",
                            code: ErrorCode.TYPE_FIELD_DUPLICATE_ID
                        }
                    });
                }
            }

            if (field instanceof this.fieldConstructor) {
                field.loc = `${this.loc}.fields[${this.fields.length}]`;
                field.setValidationCallback((err) => this.updateValidity(err));

                if (this.eventHub) {
                    this.eventHub.emit("field.create", field);
                }

                this.fields.push(field);
                return field;
            } else {
                field.name = field.name || this.getNextAvailableName(this.nameBase);
                const loc  = incrementLastLoc(this.fields, `${this.loc}.fields`);
                const f    = new this.fieldConstructor(field, loc, this.eventHub);
                f.setValidationCallback((err) => this.updateValidity(err));

                if (this.eventHub) {
                    this.eventHub.emit("field.create", f);
                }

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

        found.clearIssue(ErrorCode.ALL);
        const index = this.fields.indexOf(found);
        if (index < 0) {
            throw(`Field ${field} does not exist on input`);
        }

        this.fields.splice(index, 1);

        for (let i = index; i < this.fields.length; i++) {
            this.fields[i].updateLoc(`${this.loc}.fields[${i}]`);
        }

        if (this.eventHub) {
            this.eventHub.emit("field.remove", found);
        }
    }

    removeAllFields() {
        if (this.fields && this.fields.length) {
            this.fields.forEach(f => {
                f.clearIssue(ErrorCode.ALL);
            });
        }

        this.fields = null;
    }
}
