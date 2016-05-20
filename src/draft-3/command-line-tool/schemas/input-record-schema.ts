import {InputRecordField} from "../fields";
import {CommandInputRecordSchema} from "./command-input-record-schema";

export interface InputRecordSchema extends CommandInputRecordSchema {

    name: string;
    
    fields?: InputRecordField[];
}