import {Parameter} from "./Parameter";
import {Binding} from "./Binding";
import {Datatype} from "./Datatype";
import {InputSchema} from "./InputSchema";


export interface InputParameter extends Parameter {
    type?: Datatype | InputSchema | string | array<Datatype | InputSchema | string>;
    id: string;
    inputBinding?: Binding;
}