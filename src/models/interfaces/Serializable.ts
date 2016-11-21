export interface Serializable<T> {
    serialize():T;
    deserialize(attr: T):void;
}