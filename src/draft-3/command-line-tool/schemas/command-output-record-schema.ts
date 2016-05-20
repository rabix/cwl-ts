import {CommandOutputRecordField} from "../fields";

export interface CommandOutputRecordSchema {
    type: "record";

    fields?: CommandOutputRecordField[];

}