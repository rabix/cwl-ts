import {Datatype} from "./Datatype";
import {CommandOutputBinding} from "./CommandOutputBinding";
import {OutputSchema} from "./OutputSchema";


export interface CommandOutputSchema {
    outputBinding?: CommandOutputBinding;
    type: Datatype |
        CommandOutputSchema |
        string |
        CommandOutputMapSchema |
        CommandOutputArraySchema |
        CommandOutputRecordSchema |
        CommandOutputEnumSchema |
        Array<Datatype |
            CommandOutputSchema |
            string |
            CommandOutputMapSchema |
            CommandOutputArraySchema |
            CommandOutputEnumSchema |
            CommandOutputRecordSchema>;
}

export type ArrayType = "array";
export interface CommandOutputArraySchema {
    outputBinding?: CommandOutputBinding;
    items: Datatype |
        CommandOutputSchema |
        CommandOutputMapSchema |
        CommandOutputArraySchema |
        CommandOutputRecordSchema |
        CommandOutputEnumSchema |
        string |

        Array<Datatype |
            CommandOutputSchema |
            CommandOutputMapSchema |
            CommandOutputArraySchema |
            CommandOutputEnumSchema |
            CommandOutputRecordSchema |
            string>;
    type: ArrayType;
}

export type RecordType = "record";
export interface CommandOutputRecordSchema {
    outputBinding?: CommandOutputBinding;
    type: RecordType;
    fields: Array<CommandOutputSchema | CommandOutputArraySchema | CommandOutputRecordSchema| CommandOutputEnumSchema | CommandOutputMapSchema>
}

export type EnumType = "enum";
export interface CommandOutputEnumSchema {
    outputBinding?: CommandOutputBinding;
    type: EnumType;
    symbols: string[];
}

export type MapType = "map";
export interface CommandOutputMapSchema {
    outputBinding?: CommandOutputBinding;
    type: MapType;
    values: string;
}