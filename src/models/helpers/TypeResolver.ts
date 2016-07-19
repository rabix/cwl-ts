export interface TypeResolution {
    type: string;
    items: string;
    fields: any[];
    symbols: string[];
    isRequired: boolean;
}

export class TypeResolver {

    static resolveType(type: any, result?: TypeResolution): TypeResolution {
        result = result || {type: null, items: null, fields: null, symbols: null, isRequired: true};

        if (type === null) {
            result.isRequired = false;
            return result;
        }

        if (typeof type === 'string') {
            let matches = /(\w+)([\[\]?]+)/g.exec(<string> type);
            if (matches) {
                if (/\?/.test(matches[2])) {
                    result.isRequired = false;
                }

                if (/\[]/.test(matches[2])) {
                    result.type  = 'array';
                    result.items = matches[1];
                } else {
                    result.type = matches[1];
                }

                return result;
            } else {
                result.type = type;
                return result;
            }
        } else if (Array.isArray(type)) {
            // check if type is required
            let nullIndex = (<Array<any>> type).indexOf('null');

            if (nullIndex > -1) {
                result.isRequired = false;
                type.splice(nullIndex, 1);
            }

            if (type.length !== 1) {
                throw("Union types not supported yet! Sorry");
            }

            if (typeof type[0] === 'string') {
                return TypeResolver.resolveType(type[0], result);
            } else {
                if (typeof type[0] === 'object') {
                    return TypeResolver.resolveType(type[0], result);
                } else {
                    throw("expected complex object, instead got " + type[0]);
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
                        return result;
                    case "enum":
                        result.symbols = type.symbols;
                        return result;
                    default:
                        throw("unmatched complex type, expected 'enum', 'array', or 'record', got '" + result.type + "'");
                }

            } else {
                throw("expected complex object with type field, instead got " + JSON.stringify(type));
            }

        } else {
            throw("expected complex object, array, or string, instead got " + type);
        }
    }

    static doesTypeMatch(type: string | null, value: any) {

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
}