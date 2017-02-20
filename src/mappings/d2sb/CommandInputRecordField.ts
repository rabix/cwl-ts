import {CommandLineBinding} from "./CommandLineBinding";
import {
    CommandInputArraySchema,
    CommandInputEnumSchema,
    CommandInputMapSchema,
    CommandInputRecordSchema,
    CommandInputSchema
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