import {Datatype} from "./Datatype";

export type Schema = {type: "record", fields: Array<Schema>} |
    {type: "array", items: Datatype | Schema | string | Array<Datatype | Schema | string>} |
    {type: "enum", symbols: Array<string>} |
    {type: "map", values: Datatype | Schema | string | Array<Datatype | Schema | string>} | //todo does SBG support all these or just string?
    {type: Datatype | Schema | string | Array<Datatype | Schema | string>}