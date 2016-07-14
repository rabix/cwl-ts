import {Datatype} from "./Datatype";
import {Schema} from "./Schema";

export interface Parameter {
    type?: Datatype | Schema | string | Array<Datatype | Schema | string>;
    label?: string;
    description?: string;
    streamable?: boolean; //todo exists in SBG?
    default?: any; //todo exists in SBG?
}