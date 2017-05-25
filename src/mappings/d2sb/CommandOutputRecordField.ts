import {
    CommandInputMapSchema, CommandInputSchema,
    CommandInputArraySchema, CommandInputRecordSchema, CommandInputEnumSchema
} from "./CommandInputSchema";
import {Datatype} from "./Datatype";
import {CommandOutputBinding} from "./CommandOutputBinding";

export interface CommandOutputRecordField {
    name: string;
    type?: Datatype | CommandInputSchema | CommandInputArraySchema | CommandInputMapSchema
        | CommandInputEnumSchema | CommandInputRecordSchema | string | Array<Datatype
        | CommandInputSchema | CommandInputArraySchema | CommandInputMapSchema
        | CommandInputEnumSchema | CommandInputRecordSchema | string>;
    outputBinding?: CommandOutputBinding;
    description?: string;
    label?: string;
}