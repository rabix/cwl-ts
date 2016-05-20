import {CommandLineBinding} from "../bindings/command-line-binding";
import {Schema} from "./schema";

export interface InputEnumSchema extends Schema {
    
    name: string;
    
    type: "enum";

    symbols: string[];

    inputBinding ?: CommandLineBinding;
}