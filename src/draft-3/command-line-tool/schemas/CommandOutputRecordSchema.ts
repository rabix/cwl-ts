import {CommandOutputRecordField} from "../fields";
import {Schema} from "./Schema";

export interface CommandOutputRecordSchema extends Schema {
    type: "record";

    fields?: CommandOutputRecordField[];

}