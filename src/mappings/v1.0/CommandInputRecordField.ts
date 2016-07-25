import {InputRecordField} from "./InputRecordField";
import {CommandLineBinding} from "./CommandLineBinding";
import {CWLType} from "./CWLType";
import {CommandInputRecordSchema} from "./CommandInputRecordSchema";
import {CommandInputEnumSchema} from "./CommandInputEnumSchema";
import {CommandInputArraySchema} from "./CommandInputArraySchema";


export interface CommandInputRecordField extends InputRecordField {


    inputBinding?: CommandLineBinding;


    /**
     * The field type
     *
     */
        type: CWLType | CommandInputRecordSchema | CommandInputEnumSchema | CommandInputArraySchema | string | Array<CWLType | CommandInputRecordSchema | CommandInputEnumSchema | CommandInputArraySchema | string>;

}