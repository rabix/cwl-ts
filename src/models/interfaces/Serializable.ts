export interface Serializable<T> {
    serialize():T;
    deserialize(T):void;
}