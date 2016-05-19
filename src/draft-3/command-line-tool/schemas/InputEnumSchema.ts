import {CommandLineBinding} from "../bindings/CommandLineBinding";
import {Schema} from "./Schema";

export interface InputEnumSchema extends Schema {
    type: "enum";

    symbols: string[];

    inputBinding ?: CommandLineBinding;
}