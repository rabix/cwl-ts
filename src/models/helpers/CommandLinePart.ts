export class CommandLinePart {
    public value: string;
    public sortingKey: Array<string|number>; // [position, index/name]

    constructor(value: string, sortingKey: Array<string|number> | string | number) {
        this.value = value.trim();

        if (Array.isArray(sortingKey)) {
            this.sortingKey = sortingKey;
        } else {
            this.sortingKey = [];
            this.sortingKey.push(sortingKey);
        }
    }

    addSortingKey(key: string | number) {
        this.sortingKey.push(key);
    }
}
