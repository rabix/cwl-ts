import {CommandInputRecordField} from "../fields";
import {Schema} from "./Schema";

export interface CommandInputRecordSchema extends Schema {

    type: "record";

    fields?: CommandInputRecordField[];
}