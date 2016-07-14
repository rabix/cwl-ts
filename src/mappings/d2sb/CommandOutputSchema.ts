import {Datatype} from "./Datatype";
import {CommandOutputBinding} from "./CommandOutputBinding";

export type CommandOutputSchema = {type: "record", fields: Array<CommandOutputSchema>, outputBinding: CommandOutputBinding} |
    {type: "array", items: Datatype | CommandOutputSchema | string | Array<Datatype | CommandOutputSchema | string>, outputBinding: CommandOutputBinding} |
    {type: "enum", symbols: Array<string>, outputBinding: CommandOutputBinding} |
    {type: "map", values: Datatype | CommandOutputSchema | string | Array<Datatype | CommandOutputSchema | string>, outputBinding: CommandOutputBinding} | //todo does SBG support all these or just string?
    {type: Datatype | CommandOutputSchema | string | Array<Datatype | CommandOutputSchema | string>, outputBinding: CommandOutputBinding}