import {Datatype} from "./Datatype";

export interface WorkflowInputSchema {
    type: Datatype |
        WorkflowInputSchema |
        string |
        WorkflowInputMapSchema |
        WorkflowInputArraySchema |
        WorkflowInputRecordSchema |
        WorkflowInputEnumSchema |
        Array<Datatype |
            WorkflowInputSchema |
            string |
            WorkflowInputMapSchema |
            WorkflowInputArraySchema |
            WorkflowInputEnumSchema |
            WorkflowInputRecordSchema>;
}

export type ArrayType = "array";
export interface WorkflowInputArraySchema {
    items: Datatype |
        WorkflowInputSchema |
        WorkflowInputMapSchema |
        WorkflowInputArraySchema |
        WorkflowInputRecordSchema |
        WorkflowInputEnumSchema |
        string |

        Array<Datatype |
            WorkflowInputSchema |
            WorkflowInputMapSchema |
            WorkflowInputArraySchema |
            WorkflowInputEnumSchema |
            WorkflowInputRecordSchema |
            string>;
    type: ArrayType;
}

export type RecordType = "record";
export interface WorkflowInputRecordSchema {
    type: RecordType;
    fields: Array<WorkflowInputSchema | WorkflowInputArraySchema | WorkflowInputRecordSchema| WorkflowInputEnumSchema | WorkflowInputMapSchema>
}

export type EnumType = "enum";
export interface WorkflowInputEnumSchema {
    type: EnumType;
    symbols: string[];
}

export type MapType = "map";
export interface WorkflowInputMapSchema {
    type: MapType;
    values: string;
}