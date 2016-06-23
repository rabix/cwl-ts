export class CWLCollection<T> {
    map: {id: string, value: T};

    add (item: T) : boolean{
        if (this.map[item.id]) {
            return false;
        }

        this.map[item.id] = item;
    }
}