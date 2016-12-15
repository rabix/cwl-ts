import {Binding} from "./Binding";
import {Expression} from "./Expression";

export interface CommandOutputBinding extends Binding {
    glob?: string | Expression;
    outputEval?: Expression;
    loadContents?: boolean;
    'sbg:inheritMetadataFrom'?: string;
    'sbg:metadata'?: {[key:string]: string | Expression};
}