export interface Serializable<T> {
    customProps: any;
    serialize():T;
    deserialize(attr: T):void;
}