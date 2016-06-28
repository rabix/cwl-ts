import {Identifiable} from "../interfaces/Identifiable";


export class CWLCollection<T extends Identifiable> {
    hashMap: {id: string, value: T};

    add (item: T) : boolean{
        if (this.hashMap[item.id]) {
            return false;
        }

        this.hashMap[item.id] = item;
    }

    map(fn: Function): Array<any> {
        let result = [];

        for (let key in this.hashMap) {
            if (this.hashMap.hasOwnProperty(key)) {
                result.push(fn(this.hashMap[key]));
            }
        }

        return result;
    }
}