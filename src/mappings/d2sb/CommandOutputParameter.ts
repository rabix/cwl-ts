import {OutputParameter} from "./OutputParameter";
import {Datatype} from "./Datatype";
import {CommandOutputSchema} from "./CommandOutputSchema";
import {CommandOutputBinding} from "./CommandOutputBinding";

export type CommandOutputParameterType = Datatype | CommandOutputSchema | string
    | Array<Datatype | CommandOutputSchema | string>;

export interface CommandOutputParameter extends OutputParameter {
    type?: CommandOutputParameterType;
    outputBinding?: CommandOutputBinding;
}