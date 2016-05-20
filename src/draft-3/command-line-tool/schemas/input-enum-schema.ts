import {CommandLineBinding} from "../bindings/command-line-binding";

export interface InputEnumSchema {
    
    name: string;
    
    type: "enum";

    symbols: string[];

    inputBinding ?: CommandLineBinding;
}