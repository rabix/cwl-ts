import {OutputParameter} from "./OutputParameter";
import {Datatype} from "./Datatype";
import {CommandOutputSchema} from "./CommandOutputSchema";
import {CommandOutputBinding} from "./CommandOutputBinding";

export interface CommandOutputParameter extends OutputParameter {
    type?: Datatype | CommandOutputSchema | string | Array<Datatype | CommandOutputSchema | string>;
    outputBinding?: CommandOutputBinding;
}