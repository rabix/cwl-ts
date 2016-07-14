import {Parameter} from "./Parameter";
import {Datatype} from "./Datatype";
import {OutputSchema} from "./OutputSchema";

export interface OutputParameter extends Parameter {
    type?: Datatype | OutputSchema | string | Array<Datatype | OutputSchema | string>;
    id: string;
}