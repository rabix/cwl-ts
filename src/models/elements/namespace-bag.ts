import {Optional} from "../../types";

interface NamespaceData {
    uri: string;
    isOriginal: boolean
}

export class NamespaceBag {

    private namespaces = new Map<string, NamespaceData>();

    constructor(namespaces = {}) {
        Object.keys(namespaces).forEach(key => this.namespaces.set(key, {
            uri: namespaces[key],
            isOriginal: true
        }));
    }

    has(namespace: string): boolean {
        return this.namespaces.has(namespace);
    }

    set(namespace: string, uri: string): void {
        this.namespaces.set(namespace, {
            uri, isOriginal: false
        });
    }

    serialize(): Optional<{}> {
        if (this.namespaces.size === 0) {
            return;
        }

        const serialized = {};
        this.namespaces.forEach((val, key) => serialized[key] = val.uri);

        return serialized;
    }

    isEmpty() {
        return this.namespaces.size === 0;
    }

    isNotEmpty(){
        return this.namespaces.size !== 0;
    }

}