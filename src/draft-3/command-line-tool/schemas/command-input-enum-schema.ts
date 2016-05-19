import {CommandLineBinding} from "../bindings";
import {Schema} from "./schema";

export interface CommandInputEnumSchema extends Schema {
    type: "enum";

    symbols: string[];

    inputBinding?: CommandLineBinding;
    
}