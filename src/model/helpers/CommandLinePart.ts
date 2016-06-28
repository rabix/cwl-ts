export class CommandLinePart {
    value: string;
    sortingKey: Array<string|number>; // [position, index/name]

    constructor(value: string, sortingKey: Array<string|number> | string | number) {
        this.value = value;

        if (typeof sortingKey === "Array") {
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
