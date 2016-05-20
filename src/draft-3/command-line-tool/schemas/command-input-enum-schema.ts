import {CommandLineBinding} from "../bindings";

export interface CommandInputEnumSchema {

    type: "enum";

    symbols: string[];

    inputBinding?: CommandLineBinding;
    
}