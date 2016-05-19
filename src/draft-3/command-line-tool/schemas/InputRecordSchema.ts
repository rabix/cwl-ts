import {InputRecordField} from "../fields";
import {Schema} from "./Schema";

export interface InputRecordSchema extends Schema {

    type: "record";

    fields?: InputRecordField[];
}