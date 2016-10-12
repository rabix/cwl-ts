import {InputParameter} from "./InputParameter";
import {Datatype} from "./Datatype";
import {
    CommandInputSchema,
    CommandInputArraySchema,
    CommandInputMapSchema,
    CommandInputRecordSchema,
    CommandInputEnumSchema
} from "./CommandInputSchema";
import {CommandLineBinding} from "./CommandLineBinding";

export interface CommandInputParameter extends InputParameter {
    type?: Datatype | CommandInputSchema | CommandInputArraySchema | CommandInputMapSchema
        | CommandInputEnumSchema | CommandInputRecordSchema | string | Array<Datatype
        | CommandInputSchema | CommandInputArraySchema | CommandInputMapSchema
        | CommandInputEnumSchema | CommandInputRecordSchema | string>;
    inputBinding?: CommandLineBinding;
    "sbg:category"?: string;
}