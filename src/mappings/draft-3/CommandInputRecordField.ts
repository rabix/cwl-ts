import {InputRecordField} from "./InputRecordField";
import {CommandLineBinding} from "./CommandLineBinding";
import {PrimitiveType} from "./PrimitiveType";
import {CommandInputRecordSchema} from "./CommandInputRecordSchema";
import {CommandInputEnumSchema} from "./CommandInputEnumSchema";
import {CommandInputArraySchema} from "./CommandInputArraySchema";


export interface CommandInputRecordField extends InputRecordField {


    inputBinding?: CommandLineBinding;


    /**
     * The field type
     *
     */
        type: PrimitiveType | CommandInputRecordSchema | CommandInputEnumSchema | CommandInputArraySchema | string | Array<PrimitiveType | CommandInputRecordSchema | CommandInputEnumSchema | CommandInputArraySchema | string>;

}