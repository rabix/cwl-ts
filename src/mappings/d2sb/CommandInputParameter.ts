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

export type CommandInputParameterType = Datatype | CommandInputSchema | CommandInputArraySchema
    | CommandInputMapSchema | CommandInputEnumSchema
    | CommandInputRecordSchema | string | Array<Datatype
    | CommandInputSchema | CommandInputArraySchema | CommandInputMapSchema
    | CommandInputEnumSchema | CommandInputRecordSchema | string>;

export interface CommandInputParameter extends InputParameter {
    type?: CommandInputParameterType;
    inputBinding?: CommandLineBinding;
    "sbg:category"?: string;
    "sbg:toolDefaultValue"?: string;
    "sbg:stageInput"?: string;
}