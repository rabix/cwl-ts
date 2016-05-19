import {InputRecordField} from "../fields";
import {Schema} from "./schema";

export interface InputRecordSchema extends Schema {

    type: "record";

    fields?: InputRecordField[];
}