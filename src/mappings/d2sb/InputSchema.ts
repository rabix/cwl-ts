import {Datatype} from "./Datatype";
import {Binding} from "./Binding";
import {ComplexType} from "./ComplexType";

export interface InputSchema {
    type: ComplexType | Datatype | InputSchema | string | Array<ComplexType | Datatype | InputSchema | string>;
    inputBinding?: Binding;
    items?: Datatype | InputSchema | string | Array<Datatype | InputSchema | string>;
    values?: string;
    symbols?: Array<string>;
    fields?: Array<InputSchema>;
}