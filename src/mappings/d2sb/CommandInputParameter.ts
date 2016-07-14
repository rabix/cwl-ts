import {InputParameter} from "./InputParameter";
import {Datatype} from "./Datatype";
import {CommandInputSchema} from "./CommandInputSchema";
import {CommandLineBinding} from "./CommandLineBinding";

type SBGStageInput = 'copy' | 'link' | null;

export interface CommandInputParameter extends InputParameter {
    type?: Datatype | CommandInputSchema | string | Array<Datatype | CommandInputSchema | string>;
    inputBinding?: CommandLineBinding;

    'sbg:category'?: string;
    'sbg:toolDefaultValue'?: string;
    'sbg:altPrefix'?: string;
    'sbg:stageInput'?: SBGStageInput;
}