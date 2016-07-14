import {Datatype} from "./Datatype";
import {CommandLineBinding} from "./CommandLineBinding";
import {InputSchema} from "./InputSchema";
import {ComplexType} from "./ComplexType";



export interface CommandInputSchema {
    inputBinding?: CommandLineBinding;
    type: Datatype |
        CommandInputSchema |
        string |
        CommandInputMapSchema |
        CommandInputArraySchema |
        CommandInputRecordSchema |
        CommandInputEnumSchema |
        Array<Datatype |
            CommandInputSchema |
            string |
            CommandInputMapSchema |
            CommandInputArraySchema |
            CommandInputEnumSchema |
            CommandInputRecordSchema>;
}

export type ArrayType = "array";
export interface CommandInputArraySchema {
    inputBinding?: CommandLineBinding;
    items: Datatype |
        CommandInputSchema |
        CommandInputMapSchema |
        CommandInputArraySchema |
        CommandInputRecordSchema |
        CommandInputEnumSchema |
        string |

        Array<Datatype |
            CommandInputSchema |
            CommandInputMapSchema |
            CommandInputArraySchema |
            CommandInputEnumSchema |
            CommandInputRecordSchema |
            string>;
    type: ArrayType;
}

export type RecordType = "record";
export interface CommandInputRecordSchema {
    inputBinding?: CommandLineBinding;
    type: RecordType;
    fields: Array<CommandInputSchema | CommandInputArraySchema | CommandInputRecordSchema| CommandInputEnumSchema | CommandInputMapSchema>
}

export type EnumType = "enum";
export interface CommandInputEnumSchema {
    inputBinding?: CommandLineBinding;
    type: EnumType;
    symbols: string[];
}

export type MapType = "map";
export interface CommandInputMapSchema {
    inputBinding?: CommandLineBinding;
    type: MapType;
    values: string;
}