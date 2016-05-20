import {InputRecordField} from "../fields";
import {Schema} from "./schema";

export interface InputRecordSchema extends Schema {

    name: string;
    
    type: "record";

    fields?: InputRecordField[];
}