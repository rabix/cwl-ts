import {Expression} from "./expression";

export type PrimitiveType = "null" | "boolean" | "int" | "long" | "float" | "double" | "string";

export type CWLType = PrimitiveType | "File" ;

export type SecondaryFileList = string | Expression | Array<string | Expression>;

export type IOFormat = string | string[] | Expression;

export type SystemResourceValue = number | string | Expression;

export type CWLVersions = "draft-2"
    | "draft-3.dev1"
    | "draft-3.dev2"
    | "draft-3.dev3"
    | "draft-3.dev4"
    | "draft-3.dev5"
    | "draft-3";