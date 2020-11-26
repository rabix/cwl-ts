import {Expression} from "./Expression";

export interface EnvironmentDef {
    envName: string;
    envValue: Expression | string;
}
