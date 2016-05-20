import {CommandOutputBinding} from "../bindings";

export interface CommandOutputEnumSchema {
    type: "enum";

    symbols: string[];

    outputBinding?: CommandOutputBinding;
}