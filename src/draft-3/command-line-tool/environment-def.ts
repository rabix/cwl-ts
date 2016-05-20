import {Expression} from "./exxpression";

export interface EnvironmentDef {
    envName: string;

    envValue: string | Expression;
}