import {CommandInputRecordField} from "../fields";
import {Schema} from "./schema";

export interface CommandInputRecordSchema extends Schema {

    type: "record";

    fields?: CommandInputRecordField[];
}