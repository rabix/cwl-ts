import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {CWLVersion} from "../../mappings/v1.0/CWLVersion";
import {Serializable} from "../interfaces/Serializable";
import {ErrorCode, ValidityError} from "./validation/ErrorCode";

export type PrimitiveType =
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

export interface TypeResolution {
    type: PrimitiveType;
    items: PrimitiveType | TypeResolution;
    fields: Array<Serializable<any>>;
    symbols: string[]
    isNullable: boolean;
    isItemOrArray: boolean;
    typeBinding: CommandLineBinding;
    name: string;
    doc?: string;
    label?: string;
    unionType?: any

}
/**
 * Name has to be present even if not initially added because of Avro compatibility
 * @name nameRequirement
 * @link https://docs.oracle.com/cd/E57769_01/html/GettingStartedGuide/avroschemas.html
 */

export class TypeResolver {

    public static resolveType(originalType: any, result?: TypeResolution): TypeResolution {
        result = result || {
                type: null,
                items: null,
                fields: null,
                symbols: null,
                isNullable: false,
                isItemOrArray: false,
                typeBinding: null,
                name: null,
                unionType: null,
                label: "",
                doc: ""
            };

        if (originalType === null || originalType === undefined) {
            result.isNullable = true;
            return result;
        }

        let tmp = originalType;

        if (typeof originalType.serialize === "function") {
            tmp = originalType.serialize();
        }

        let type;

        // clone type object because it will be sliced and modified later
        try {
            type = JSON.parse(JSON.stringify(tmp));
        } catch (err) {
            type = {...tmp};
            console.error(err);
        }

        if (typeof type === 'string') {
            let matches = /(\w+)([\[\]?]+)/g.exec(<string> type);
            if (matches) {
                if (/\?/.test(matches[2])) {
                    result.isNullable = true;
                }

                if (/\[]/.test(matches[2])) {
                    result.type  = 'array';
                    result.items = <PrimitiveType> matches[1];
                } else {
                    result.type = <PrimitiveType> matches[1];
                }

                return result;
            } else {
                result.type = <PrimitiveType> type;
                return result;
            }
        } else if (Array.isArray(type)) {
            // check if type is required
            let nullIndex = (<Array<any>> type).indexOf('null');

            if (nullIndex > -1) {
                result.isNullable = true;
                type.splice(nullIndex, 1);
            }

            if (type.length !== 1) {
                // check if type has only two remaining values
                if (type.length === 2) {
                    // resolve types to TypeResolution
                    const type0 = TypeResolver.resolveType(type[0]);
                    const type1 = TypeResolver.resolveType(type[1]);

                    // check if types are actually item and item[]
                    if (type0.items === type1.type || type1.items === type0.type) {
                        // remove type which is array for encoding
                        type0.type === "array" ? type.splice(0, 1) : type.splice(1, 1);
                        result.isItemOrArray = true;
                    } else {
                        result.unionType = type;
                        throw new ValidityError(`TypeResolverError: Union types not supported yet. Found type ${type}`, ErrorCode.TYPE_UNSUPPORTED);
                    }

                } else {
                    result.unionType = type;
                    throw new ValidityError(`TypeResolverError: Union types not supported yet! Found type ${type}`, ErrorCode.TYPE_UNSUPPORTED);
                }
            }

            if (typeof type[0] === 'string') {
                return TypeResolver.resolveType(type[0], result);
            } else {
                if (typeof type[0] === 'object') {
                    return TypeResolver.resolveType(type[0], result);
                } else {
                    throw new ValidityError("TypeResolverError: expected complex object, instead got " + type[0], ErrorCode.TYPE_UNSUPPORTED);
                }
            }
        } else if (typeof type === 'object') {
            if (type.type) {

                if (type.doc) {
                    result.doc = type.doc;
                }

                if (type.label) {
                    result.label = type.label;
                }

                // result type has already been set, pass through is evaluating complex items type
                if (result.type === "array") {
                    result.items = type.type;
                } else {
                    // first pass through, type should be set  on result
                    result.type = type.type;
                }
                switch (type.type) {
                    case "array":
                        result.typeBinding = type.inputBinding || null;
                        if (typeof type.items === 'string') {
                            // primitive types don't need to be reevaluated
                            result.items = type.items;
                            return result;
                        } else if (Array.isArray(type.items) || type.items.type === "array") {
                            // complex types that aren't currently supported but should be preserved
                            result.items = type.items;
                            return result;
                        } else {
                            // complex types should be reevaluated to set fields/symbols/items properties
                            return TypeResolver.resolveType(type.items, result);
                        }
                    case "record":
                        result.fields = type.fields;
                        result.name   = type.name || null;
                        return result;
                    case "enum":
                        result.symbols = type.symbols;
                        result.name    = type.name || null;
                        return result;
                    case "string":
                    case "File":
                    case "null":
                    case "boolean":
                    case "int":
                    case "long":
                    case "Directory":
                    case "double":
                        return result;
                    default:
                        throw new ValidityError("TypeResolverError: unmatched complex type, expected 'enum', 'array', or 'record', got '" + type.type + "'", ErrorCode.TYPE_UNSUPPORTED);
                }

            } else {
                throw new ValidityError("TypeResolverError: expected complex object with type field, instead got " + JSON.stringify(type), ErrorCode.TYPE_UNSUPPORTED);
            }

        } else {
            throw new ValidityError("TypeResolverError: expected complex object, array, or string, instead got " + type, ErrorCode.TYPE_UNSUPPORTED);
        }
    }

    public static doesTypeMatch(type: PrimitiveType, value: any) {

        if (type) {
            switch (type) {
                case 'int':
                case 'float':
                case 'long':
                case 'double':
                    return typeof value === 'number';
                case 'File':
                case 'record':
                case "Directory":
                    return typeof value === 'object' && !Array.isArray(value);
                case 'array':
                    return Array.isArray(value);
                case 'enum':
                    return typeof value === 'string';
                default:
                    return typeof value === type;
            }
        }

        return true;
    }

    public static serializeType(type: TypeResolution, version?: CWLVersion): any {
        let t;

        if (type.unionType) {
            let union = type.unionType;
            type.type === "array" ? type.items = union : type.type = union;

            if (type.isNullable) {
                union.push("null");
                type.isNullable = false;
            }
        }

        if (type.type === null || type.type === undefined) {
            return null;
        }


        switch (type.type) {
            case "array":
                if (type.items === "enum") {
                    t = {
                        type: "array",
                        items: {
                            type: "enum",
                            /** @see nameRequirement */
                            name: type.name || "",
                            symbols: type.symbols
                        }
                    }
                } else if (type.items === "record") {
                    t = {
                        type: "array",
                        items: {
                            type: "record",
                            /** @see nameRequirement */
                            name: type.name || "",
                            fields: type.fields.map(field => {
                                if (typeof field.serialize === "function") {
                                    return field.serialize();
                                } else {
                                    return field;
                                }
                            })
                        }
                    }
                } else if (version === "v1.0" && !type.typeBinding && typeof type.items === "string") {
                    t = `${type.items}[]`;
                } else {
                    t = {
                        type: "array",
                        items: type.items
                    };
                    if (type.typeBinding) t.inputBinding = type.typeBinding;
                }

                break;

            case "record":
                t = {
                    type: "record",
                    fields: type.fields.map(field => {
                        if (typeof field.serialize === "function") {
                            return field.serialize();
                        } else {
                            return field;
                        }
                    }),
                    /** @see nameRequirement */
                    name: type.name || ""
                };
                if (type.typeBinding) t.inputBinding = type.typeBinding;
                break;

            case "enum":
                t = {
                    type: "enum",
                    symbols: type.symbols,
                    /** @see nameRequirement */
                    name: type.name || ""
                };

                if (type.typeBinding) t.inputBinding = type.typeBinding;
                break;

            default:
                t = type.type;
        }

        if (type.doc) {
            t.doc = type.doc;
        }

        if (type.label) {
            t.label = type.label;
        }

        // type should be serialized as an array of ["item", "item[]"]
        if (type.isItemOrArray) {
            const tArr = {
                type: "array",
                items: t
            };

            t = [t];
            t.push(tArr);

            if (type.isNullable) {
                t.unshift("null");
            }

            return t;
        }

        if (type.isNullable) {
            t = version === "v1.0" && typeof t === "string" ? `${t}?` : ["null", t];
        } else if (version !== "v1.0") {
            t = [t];
        }

        return t;
    }
}
