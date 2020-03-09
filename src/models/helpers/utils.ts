import {
    CommandInputParameterModel,
    CommandOutputParameterModel,
    ParameterTypeModel,
    WorkflowOutputParameterModel
} from "../generic";
import {InputParameterModel} from "../generic/InputParameterModel";
import {ErrorCode, Issue, ValidityError} from "./validation";

export const flatArray = (arr: any [], d: number = 1) => {
    return d > 0 ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatArray(val, d - 1) : val), [])
        : arr.slice();
};

export const ensureArray = (map: { [key: string]: any }
    | any[]
    | string
    | number
    | boolean, key?: string, valueKey?: string): any[] => {
    // object is not defined or is null, return an empty array
    if (map === undefined || map === null) return [];

    if (Array.isArray(map)) {
        // if the object is already an array of objects, we don't want to transform it
        if (typeof map[0] === "object" || key === undefined) {
            return [...map];
        } else {
            // if it's an array of something else, transform each element into {key: <any>item}
            return map.map(item => ({[key]: item}));
        }
    }

    // if the object is a primitive, wrap it in an array
    if (typeof map === "string" || typeof map === "number" || typeof map === "boolean") {
        return [map];
    }

    // if the object is a hashmap, transform it accordingly
    return Object.keys(map).map(prop => {
        /*
         if a valueKey is provided and the property isn't already an object, create an object from the valueKey
         e.g.: map = {foo: "bar"}, key = "id", valueKey = "type"

         return value is [ {id: "foo", type: "bar"} ];
         */
        if (valueKey && checkMapValueType(map) !== "object" && checkValueType(map[prop]) !== "object") {
            return {... {[valueKey]: map[prop]}, ...{[key]: prop}};
        }

        /*
         if they property is already an object, add its hashmap key under the property key provided as a param
         e.g.: map = {foo: {bar: "baz"}}, key = "id", valueKey = "type"

         return value is [ {id: "foo", bar: "baz"} ];
         */
        return {... map[prop], ...{[key]: prop}};
    });
};

/**
 * Checks the type of each property in a hashMap. Returns "mismatch" if property types are mixed,
 * otherwise returns type that corresponds to all properties.
 */
export const checkMapValueType = (map: { [key: string]: any }): "string"
    | "number"
    | "undefined"
    | "object"
    | "array"
    | "null"
    | "mismatch" => {
    let type = null;

    Object.keys(map).forEach((key) => {
        let valType = checkValueType(map[key]);

        if (type && valType !== type) {
            type = "mismatch";
            return type;
        } else {
            type = valType;
        }
    });

    return type;
};

export const checkValueType = (value: any): "string"
    | "number"
    | "undefined"
    | "object"
    | "array"
    | "null" => {
    let valType;

    if (Array.isArray(value)) {
        valType = "array";
    } else if (value === null) {
        valType = "null";
    } else if (typeof value === "object") {
        valType = "object";
    } else {
        valType = typeof value;
    }

    return valType;
};

export const incrementString = (str: string): string => {
    const replaced = str.replace(/^(.*?)(\d+$)/gi, function (all, $1, $2) {
        return $1 + ++$2;
    });

    if (replaced === str) return str + "_1";
    return replaced;
};

export const spreadAllProps = (destObj: Object, sourceObj: Object): any => {
    return {...{}, ...destObj, ...sourceObj};
};

export const spreadSelectProps = (sourceObj: Object, destObj: Object, keys: string[]): void => {
    Object.keys(sourceObj).forEach(key => {
        if (keys.indexOf(key) === -1 && sourceObj[key] !== undefined) {
            destObj[key] = sourceObj[key];
        }
    });
};

export const intersection = (arrA: Array<any> = [], arrB: Array<any> = []): Array<any> => {
    return arrA.filter(item => {
        return arrB.indexOf(item) !== -1;
    });
};

export const commaSeparatedToArray = (str: string | string[]): string[] => {
    if (!str) return [];
    if (Array.isArray(str)) return str;

    return str.replace(/\s/g, "").split(",");
};

export const charSeparatedToArray = (str: string | string[], pattern: RegExp): string[] => {
    if (!str) return [];
    if (Array.isArray(str)) return str;

    return str.split(pattern).map(s => s.trim());
};

export const snakeCase = (str: string = ""): string => {
    return str.replace(/[\s.\[\/\]-]+/g, "_").replace(/([A-Z])/g, (match) => "_" + match.toLowerCase());
};

export const isEmpty = (obj: Object | any[]): boolean => {
    if (Array.isArray(obj)) {
        return obj.length === 0;
    } else if (typeof obj === "object" && obj !== null) {
        return Object.keys(obj).length === 0;
    }
};

export const fetchByLoc = (obj: any, loc: string): any => {
    // change "foo.bar[3]['baz']" to "foo.bar.3.'baz'"
    loc             = loc.replace(/\[/g, ".[").replace(/[\[\]]/g, "");
    // to ["foo", "bar", "3", "'baz'"]
    const tokens    = loc.split(".").filter(tok => tok.length);
    let result: any = obj;

    while (tokens.length) {
        // take first token, remove quotes
        const token = tokens.shift().replace(/["']/g, "");

        // attempt to access property
        try {
            // if token is number, cast to int
            if (!isNaN(<any> token)) {
                result = result[parseInt(token, 10)]
            } else {
                // otherwise access property
                result = result[token];
            }
        } catch (ex) {
            // if property doesn't exist, return undefined
            return undefined;
        }
    }

    return result;
};

export const cleanupNull = (obj: Object): any => {
    const keys = Object.keys(obj);
    let tmp    = {...obj};
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (obj[key] === undefined || obj[key] === null) {
            delete tmp[key];
        }
    }

    return tmp;
};

export const nullifyObjValues = (obj: Object): any => {
    const keys = Object.keys(obj);
    let tmp    = {...obj};
    for (let i = 0; i < keys.length; i++) {
        tmp[keys[i]] = null;
    }

    return tmp;
};

/**
 * FIXME: any unicode string should be a valid ID. Split connectionID props into distinct chunk map and sync that with SVG
 */
export function validateID(id: string) {
    if (!id) {
        throw new ValidityError("ID must be set", ErrorCode.ID_MISSING);
    }

    const invalidChars     = new Set<string>();
    const validPattern     = "a-zA-Z0-9_;?\\-:@&=+$,.#!~*'()\\[\\]";
    const invalidCharRegex = new RegExp(`[^${validPattern}]`, "g");

    let match;
    while (match = invalidCharRegex.exec(id)) {
        invalidChars.add(match[0]);
    }

    if (invalidChars.size) {
        const list = Array.from(invalidChars);
        const formattedList = list.map(v => `“${v}”`).join(", ");
        throw new ValidityError(`ID “${id}” contains invalid characters: ${formattedList}`, ErrorCode.ID_INVALID_CHAR, list);
    }
}

export const incrementLastLoc = (items: { loc: string }[] = [], prefix: string) => {
    if (items.length === 0) {
        return `${prefix}[0]`
    }

    const lastItem = items[items.length - 1];

    let match: any = ((lastItem.loc.match(/\[(\d+)]$/g) || [""])[0].match(/\d+/g) || [""])[0];

    if (!match) return null;

    match = parseInt(match);

    return `${prefix}[${++match}]`;
};

/**
 * Returns true if port is of type or type[]
 * If type is an array, will check if port is single item or array of any of types
 * @param port
 * @param type
 */
export const isType = (port: { type: ParameterTypeModel },
                       type: string | string[]): boolean => {
    if (!port.type || !port.type.type) {
        return false;
    }

    if (typeof type === "string") type = [type];

    return type.filter(t => port.type.type === t || port.type.items === t).length > 0;
};


export const checkIfConnectionIsValid = (pointA, pointB, ltr = true) => {

    // if both ports belong to the same step, connection is not possible
    if (pointA.parentStep && pointB.parentStep && pointA.parentStep.id === pointB.parentStep.id) {
        throw new ValidityError(`Invalid connection. Source and destination ports belong to the same step`, ErrorCode.CONNECTION_SAME_STEP);
    }

    const getType = (type) => {
        if (typeof type === "string") {
            return type;
        }

        if (Array.isArray(type)) {
            return "union";
        }
        if (typeof type === "object" && type !== null) {
            return "object";
        }
    };

    // fetch type
    const pointAType  = pointA.type.type;
    const pointBType  = pointB.type.type;
    const pointAItems = getType(pointA.type.items);
    const pointBItems = getType(pointB.type.items);

    // match types, defined types can be matched with undefined types
    if (pointAType === pointBType // match exact type
        || ((pointAItems === pointBType || pointAItems === "union") && !ltr) //match File[] to File
        || ((pointBItems === pointAType || pointBItems === "union") && ltr) // match File to File[]
        || pointAType === "null"
        || pointBType === "null") {

        // If union[] -> any[] or vice versa
        if (pointBItems === "union" || pointAItems === "union") {
            return true;
        }

        // If record[] -> object[] or vice versa
        if ((pointBItems === "record" && pointAItems === "object")
            || (pointAItems === "record" && pointBItems === "object")) {
            return true;
        }

        // if both are arrays but not of the same type
        if (pointAItems && pointBItems && pointAItems !== pointBItems) {
            throw new ValidityError(`Invalid connection. Connection type mismatch, attempting to connect "${pointAItems}[]" to "${pointBItems}[]"`, ErrorCode.CONNECTION_TYPE);
        }
        // if type match is file, and fileTypes are defined on both ports,
        // match only if fileTypes match
        if ((pointAType === "File" || pointAItems === "File") && pointB.fileTypes.length && pointA.fileTypes.length) {
            if (!!intersection(pointB.fileTypes.map((type) => type.toLowerCase()), pointA.fileTypes.map(type => type.toLowerCase())).length) {
                return true;
            } else {
                throw new ValidityError(`Invalid connection. File type mismatch, connecting formats "${pointA.fileTypes}" to "${pointB.fileTypes}"`, ErrorCode.CONNECTION_FILE_TYPE);
            }
        }

        // if not file or fileTypes not defined
        return true;
    }

    // if types are both defined and do not match
    const pointATypeOutput = pointAItems ? `"${pointAItems}[]"` : `"${pointAType}"`;
    const pointBTypeOutput = pointBItems ? `"${pointBItems}[]"` : `"${pointBType}"`;

    throw new ValidityError(`Invalid connection. Connection type mismatch, attempting to connect ${pointATypeOutput} to ${pointBTypeOutput}`, ErrorCode.CONNECTION_TYPE);
};

export const flatten = (arr: any[]) => {
    const _flatten = (arr: any[], res: any[]) => {
        for (let i = 0; i < arr.length; i++) {
            const a = arr[i];
            if (Array.isArray(a)) {
                _flatten(a, res);
            } else {
                res.push(a);
            }
        }
    };

    const res = [];
    _flatten(arr, res);
    return res;
};

export const returnNumIfNum = (s: any): any | number => {
    return isNaN(s) ? s : parseInt(s);
};

export const isFileType = (i: { type: { isNullable: boolean, type: string, items: string } }, required?): boolean => {
    const requiredMatches = required === undefined || i.type.isNullable !== required;
    return i.type && requiredMatches && (i.type.type === "File" || i.type.items === "File")
};

export const hasFileType = (port: { type: ParameterTypeModel }): boolean => {
    if (isFileType(port)) return true;

    if (Array.isArray(port.type.fields)) {
        for (let i = 0; i < port.type.fields.length; i++) {
            const field = port.type.fields[i];
            if (hasFileType(field)) return true;
        }
    }

    return false;
};

/**
 * Returns the next available ID based on the provided ID which is unique in the given array.
 * @param {string} id
 * @param {Array<{id: string}>} set
 * @returns {string}
 */
export const getNextAvailableId = (id: string, set: Array<{ id: string }>) => {
    let hasId  = true;
    let result = id;

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
};

export const checkIdValidity = (id: string, scope: Array<CommandInputParameterModel | CommandOutputParameterModel>) => {
    validateID(id);

    const next = getNextAvailableId(id, scope);
    if (next !== id) {
        throw new ValidityError(`ID "${id}" already exists in this tool, the next available id is "${next}"`, ErrorCode.ID_DUPLICATE);
    }
};

export const concatIssues = (base: { [key: string]: Issue[] }, add: { [key: string]: Issue[] | Issue }, overwrite: boolean): any => {
    const addKeys = Object.keys(add);

    for (let i = 0; i < addKeys.length; i++) {
        const key = addKeys[i];
        // base[key] is an array and add[key] is an item or an array, can be concatenated
        if (base[key] && add[key] !== null) {
            if (overwrite) {
                base[key] = <Issue[]> (Array.isArray(add[key]) ? add[key] : [add[key]]);
            } else {
                const toAdd = <Issue[]> (Array.isArray(add[key]) ? add[key] : [add[key]]);
                for (let i = 0; i < toAdd.length; i++) {
                    if (!issueExistsInArray(base[key], toAdd[i])) {
                        base[key].push(toAdd[i]);
                    }
                }
            }
        } else {
            if (Array.isArray(add[key]) || add[key] === null) {
                base[key] = <Issue[]> add[key];
            } else {
                base[key] = [<Issue> add[key]];
            }
        }
    }

    return base;
};

export const issueExistsInArray = (arr: Issue[], item: Issue): boolean => {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].code === item.code && arr[i].message === item.message) {
            return true;
        }
    }

    return false;
};

export const checkPortIdUniqueness = (ports: Array<InputParameterModel | WorkflowOutputParameterModel | CommandOutputParameterModel>): void => {
    const map       = {};
    const duplicate = [];

    for (let i = 0; i < ports.length; i++) {
        const p = ports[i];

        if (map[p.id]) {
            duplicate.push(p);
        } else {
            map[p.id] = true;
        }
    }

    if (duplicate.length > 0) {
        for (let i = 0; i < duplicate.length; i++) {
            const port = duplicate[i];

            port.setIssue({
                [`${port.loc}.id`]: {
                    type: "error",
                    code: ErrorCode.ID_DUPLICATE,
                    message: `Duplicate id found: “${port.id}”`
                }
            });
        }
    }
};
