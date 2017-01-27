export const ensureArray = (map: {[key: string]: any} | any[], key: string, valueKey?: string): any[] => {
    if (Array.isArray(map)) {
      if (typeof map[0] === "object") {
          return map;
      } else {
          return map.map(item => ({[key]: item}));
      }
    }

    if (!map) return [];

    return Object.keys(map).map(prop => {
        if (valueKey && checkMapValueType(map) !== "object") {
            return {... {[valueKey]: map[prop]},...{[key]: prop}};
        }
        return {... map[prop], ...{[key]: prop}};
    });
};

export const checkMapValueType = (map: {[key: string]: any}): "string" | "number" | "undefined" | "object" | "array" | "null" | "mismatch" => {
    let type = null;

    Object.keys(map).forEach((key) => {
        let valType;
        const value = map[key];

        if (Array.isArray(value)) {
            valType = "array";
        } else if (value === null) {
            valType = "null";
        } else if (typeof value === "object") {
            valType = "object";
        } else {
            valType = typeof value;
        }

        if (type && valType !== type) {
            type = "mismatch";
            return type;
        } else {
            type = valType;
        }
    });

    return type;
};

export const convertToObject = (item: any, key: string): {[key: string]: any} => {
    return {[key]: item};
};