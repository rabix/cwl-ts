import {CommandOutputBinding} from "../bindings";
import {Schema} from "./Schema";

export interface CommandOutputEnumSchema extends Schema {
    type: "enum";

    symbols: string[];

    outputBinding?: CommandOutputBinding;
}