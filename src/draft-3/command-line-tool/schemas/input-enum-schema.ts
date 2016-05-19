import {CommandLineBinding} from "../bindings/command-line-binding";
import {Schema} from "./schema";

export interface InputEnumSchema extends Schema {
    type: "enum";

    symbols: string[];

    inputBinding ?: CommandLineBinding;
}