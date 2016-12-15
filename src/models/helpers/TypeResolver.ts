import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {CommandInputRecordField} from "../../mappings/d2sb/CommandInputRecordField";
import {CWLVersion} from "../../mappings/v1.0/CWLVersion";
import {CommandOutputSchema} from "../../mappings/d2sb/CommandOutputSchema";

export type PrimitiveType = "array" | "enum" | "record" | "File" | "string" | "int" | "float" | "null" | "boolean" | "long" | "double" | "bytes" | "map";

export interface TypeResolution {
    type: PrimitiveType;
    items: PrimitiveType;
    fields: Array<CommandInputRecordField>|Array<CommandOutputSchema>;
    symbols: string[]
    isNullable: boolean;
    typeBinding: CommandLineBinding;
    name: string;
}

export class TypeResolver {

    public static resolveType(type: any, result?: TypeResolution): TypeResolution {
        result = result || {
                type: null,
                items: null,
                fields: null,
                symbols: null,
                isNullable: false,
                typeBinding: null,
                name: null
            };


        if (type === null || type === undefined) {
            result.isNullable = true;
            return result;
        }

        // clone type object because it will be sliced and modified later
        type = JSON.parse(JSON.stringify(type));

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
                throw("TypeResolverError: Union types not supported yet! Sorry");
            }

            if (typeof type[0] === 'string') {
                return TypeResolver.resolveType(type[0], result);
            } else {
                if (typeof type[0] === 'object') {
                    return TypeResolver.resolveType(type[0], result);
                } else {
                    throw("TypeResolverError: expected complex object, instead got " + type[0]);
                }
            }
        } else if (typeof type === 'object') {
            if (type.type) {
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
                    case "double":
                        return result;
                    default:
                        throw("TypeResolverError: unmatched complex type, expected 'enum', 'array', or 'record', got '" + type.type + "'");
                }

            } else {
                throw("TypeResolverError: expected complex object with type field, instead got " + JSON.stringify(type));
            }

        } else {
            throw("TypeResolverError: expected complex object, array, or string, instead got " + type);
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

        switch (type.type) {
            case "array":
                if (version === "v1.0" && !type.typeBinding) {
                    t = `${type.items}[]`;
                } else {
                    t = {
                        type: "array",
                        items: type.items
                    };
                    if (type.typeBinding) t.inputBinding = t;
                }

                break;

            case "record":
                t = {
                    type: "record",
                    fields: type.fields,
                    name: type.name
                };
                if (type.typeBinding) t.inputBinding = t;
                break;

            case "enum":
                t = {
                    type: "enum",
                    symbols: type.symbols,
                    name: type.name
                };

                if (type.typeBinding) t.inputBinding = t;
                break;

            default:
                t = type.type;
        }

        if (type.isNullable) {
            t = version === "v1.0" ? `${t}?` : ["null", t];
        } else if (version !== "v1.0") {
            t = [t];
        }

        return t;
    }
}