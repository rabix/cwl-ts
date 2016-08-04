import {PrimitiveType} from "./PrimitiveType";
import {RecordSchema} from "./RecordSchema";
import {EnumSchema} from "./EnumSchema";


export interface ArraySchema {


    /**
     * Must be `array`
     */
        type: "array";


    /**
     * Defines the type of the array elements.
     */
    items: PrimitiveType | RecordSchema | EnumSchema | ArraySchema | string | Array<PrimitiveType | RecordSchema | EnumSchema | ArraySchema | string>;

}