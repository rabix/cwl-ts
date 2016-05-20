import {InputRecordField} from "../fields";

export interface InputRecordSchema {

    name: string;
    
    type: "record";

    fields?: InputRecordField[];
}