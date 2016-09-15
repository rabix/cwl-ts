import {Datatype} from "./Datatype";
import {ComplexType} from "./ComplexType";

export interface OutputSchema {
    type: ComplexType | Datatype | OutputSchema | string | Array<ComplexType | Datatype | OutputSchema | string>;
    items?: Datatype | OutputSchema | string | Array<Datatype | OutputSchema | string>;
    values?: string;
    symbols?: Array<string>;
    fields?: Array<OutputSchema>;
}