import {Datatype} from "./Datatype";
import {Binding} from "./Binding";

export type InputSchema = {type: "record", fields: Array<InputSchema>, inputBinding?: Binding} |
    {type: "array", items: Datatype | InputSchema | string | Array<Datatype | InputSchema | string>, inputBinding?: Binding} |
    {type: "enum", symbols: Array<string>, inputBinding?: Binding} |
    {type: "map", values: Datatype | InputSchema | string | Array<Datatype | InputSchema | string>, inputBinding?: Binding} | //todo does SBG support all these or just string?
    {type: Datatype | InputSchema | string | Array<Datatype | InputSchema | string>, inputBinding?: Binding}