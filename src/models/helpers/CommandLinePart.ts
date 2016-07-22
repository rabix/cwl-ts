import {MSDSortable} from "./MSDSort";

export class CommandLinePart implements MSDSortable {
    public value: string;
    public sortingKey: Array<number | string>; // [position, index/name]

    constructor(value: string, sortingKey: Array<number | string> | number | string) {
        this.value = value.trim();

        if (Array.isArray(sortingKey)) {
            this.sortingKey = sortingKey;
        } else {
            this.sortingKey = [];
            this.sortingKey.push(sortingKey);
        }
    }

    pushKey(key: number | string) {
        this.sortingKey.push(key);
    }

    unshiftKey(key: number | string) {
        this.sortingKey.unshift(key);
    }
}
