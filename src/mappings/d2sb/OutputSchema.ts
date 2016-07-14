import {Datatype} from "./Datatype";

export type OutputSchema = {type: "record", fields: Array<OutputSchema>} |
    {type: "array", items: Datatype | OutputSchema | string | Array<Datatype | OutputSchema | string>} |
    {type: "enum", symbols: Array<string>} |
    {type: "map", values: Datatype | OutputSchema | string | Array<Datatype | OutputSchema | string>} | //todo does SBG support all these or just string?
    {type: Datatype | OutputSchema | string | Array<Datatype | OutputSchema | string>}