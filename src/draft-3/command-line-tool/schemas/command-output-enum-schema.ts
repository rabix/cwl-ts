import {CommandOutputBinding} from "../bindings";
import {Schema} from "./schema";

export interface CommandOutputEnumSchema extends Schema {
    type: "enum";

    symbols: string[];

    outputBinding?: CommandOutputBinding;
}