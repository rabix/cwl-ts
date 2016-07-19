import {Binding} from "./Binding";
import {Expression} from "./Expression";

export interface CommandLineBinding extends Binding {
    position?: number;
    prefix?: string;
    separate?: boolean;
    itemSeparator?: string;
    valueFrom?: string | Expression;
}