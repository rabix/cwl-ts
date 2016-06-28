import {Identifiable} from "../interfaces/Identifiable";

interface IdentifiableMap<T> {
    id: string, item: T
}

export class CWLCollection<T extends Identifiable> {
    values: IdentifiableMap<T>;

    add (item: T) : boolean{
        if (this.values[item.id]) {
            return false;
        }

        this.values[item.id] = item;
    }

    remove (item: string|T) : boolean {
        let id = typeof item === 'string' ? item : item.id;

        if (!this.values[id]) {
            return false;
        }

        delete this.values[id];
        return true;
    }

    map(fn: Function): Array<any> {
        let result = [];

        for(let id in this.values) {
            result.push(fn(this.values[id]));
        }

        return result;
    }

    constructor() {
        this.values = <IdentifiableMap<T>>{};
    }
}