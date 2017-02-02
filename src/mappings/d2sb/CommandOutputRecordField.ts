import {CommandLineBinding} from "../draft-3/CommandLineBinding";
import {
    CommandInputMapSchema, CommandInputSchema,
    CommandInputArraySchema, CommandInputRecordSchema, CommandInputEnumSchema
} from "./CommandInputSchema";
import {Datatype} from "./Datatype";

export interface CommandOutputRecordField {
    name: string;
    type?: Datatype | CommandInputSchema | CommandInputArraySchema | CommandInputMapSchema
        | CommandInputEnumSchema | CommandInputRecordSchema | string | Array<Datatype
        | CommandInputSchema | CommandInputArraySchema | CommandInputMapSchema
        | CommandInputEnumSchema | CommandInputRecordSchema | string>;
    outputBinding?: CommandLineBinding;
    description?: string;
    label?: string;
}