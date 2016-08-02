import {CommandLineBinding} from "../draft-3/CommandLineBinding";
import {
    CommandInputMapSchema, CommandInputSchema,
    CommandInputArraySchema, CommandInputRecordSchema, CommandInputEnumSchema
} from "./CommandInputSchema";
import {Datatype} from "./Datatype";

export interface CommandInputRecordField {
    name: string;
    type?: Datatype | CommandInputSchema | CommandInputArraySchema | CommandInputMapSchema
        | CommandInputEnumSchema | CommandInputRecordSchema | string | Array<Datatype
        | CommandInputSchema | CommandInputArraySchema | CommandInputMapSchema
        | CommandInputEnumSchema | CommandInputRecordSchema | string>;
    inputBinding?: CommandLineBinding;
    description?: string;
    label?: string;
}