import {InputParameter} from "./InputParameter";
import {Datatype} from "./Datatype";
import {CommandInputSchema} from "./CommandInputSchema";
import {CommandLineBinding} from "./CommandLineBinding";

export interface CommandInputParameter extends InputParameter {
    type?: Datatype | CommandInputSchema | string | Array<Datatype | CommandInputSchema | string>;
    inputBinding?: CommandLineBinding;
}