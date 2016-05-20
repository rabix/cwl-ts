import {CommandInputRecordField} from "../fields";

export interface CommandInputRecordSchema {

    type: "record";

    fields?: CommandInputRecordField[];
}