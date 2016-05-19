import {CommandOutputRecordField} from "../fields";
import {Schema} from "./schema";

export interface CommandOutputRecordSchema extends Schema {
    type: "record";

    fields?: CommandOutputRecordField[];

}