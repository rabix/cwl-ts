import {Expression} from "./expression";

export interface EnvironmentDef {
    envName: string;

    envValue: string | Expression;
}