import {CommandLineBinding} from "../bindings";
import {Schema} from "./Schema";

export interface CommandInputEnumSchema extends Schema {
    type: "enum";

    symbols: string[];

    inputBinding?: CommandLineBinding;
    
}