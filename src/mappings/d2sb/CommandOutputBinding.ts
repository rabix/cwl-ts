import {Expression} from "./Expression";
import {Binding} from "./Binding";

export interface CommandOutputBinding extends Binding {
    glob?: string | Expression | string[];
    outputEval?: Expression;
    'sbg:inheritMetadataFrom'?: string;
    'sbg:metadata'?: {[key:string]: string};
}