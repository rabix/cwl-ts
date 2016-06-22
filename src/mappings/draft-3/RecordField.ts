import {PrimitiveType} from "./PrimitiveType";
import {RecordSchema} from "./RecordSchema";
import {EnumSchema} from "./EnumSchema";
import {ArraySchema} from "./ArraySchema";


/**
 * A field of a record.
 */

export interface RecordField {


    /**
     * The name of the field
     *
     */
    name: string;


    /**
     * A documentation string for this field
     *
     */
    doc?: string;


    /**
     * The field type
     *
     */
        type: PrimitiveType | RecordSchema | EnumSchema | ArraySchema | string | Array<PrimitiveType | RecordSchema | EnumSchema | ArraySchema | string>;

}