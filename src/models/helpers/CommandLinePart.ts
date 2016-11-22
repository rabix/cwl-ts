import {MSDSortable} from "./MSDSort";
export type CommandType = "baseCommand" | "input" | "argument" | "stdin" | "stdout" | "error" | "warning"

export class CommandLinePart implements MSDSortable {
    public value: string;
    public sortingKey: Array<number | string>; // [position, index/name]

    public type: CommandType;

    constructor(value: string, sortingKey: Array<number | string> | number | string, type: CommandType) {
        value = value === undefined ? '' : value; // in case expression returned undefined
        value = value.toString(); // in case expression returned something other than a string
        this.value = value.trim();
        this.type = type;

        if (Array.isArray(sortingKey)) {
            this.sortingKey = <Array<string|number>> sortingKey;
        } else {
            this.sortingKey = [];
            this.sortingKey.push(<string|number>sortingKey);
        }
    }

    pushKey(key: number | string) {
        this.sortingKey.push(key);
    }

    unshiftKey(key: number | string) {
        this.sortingKey.unshift(key);
    }
}
