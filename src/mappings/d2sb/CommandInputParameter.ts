import {InputParameter} from "./InputParameter";
import {Datatype} from "./Datatype";
import {CommandInputSchema} from "./CommandInputSchema";
import {CommandLineBinding} from "./CommandLineBinding";

type SBGStageInput = 'copy' | 'link';

export interface CommandInputParameter extends InputParameter {
    type?: Datatype | CommandInputSchema | string | Array<Datatype | CommandInputSchema | string>;
    inputBinding?: CommandLineBinding;

    'sbg:category'?: string | null;
    'sbg:toolDefaultValue'?: string | null;
    'sbg:altPrefix'?: string | null;
    'sbg:stageInput'?: SBGStageInput | null;
}