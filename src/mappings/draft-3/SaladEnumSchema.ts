import {EnumSchema} from "./EnumSchema";
import {SchemaDefinedType} from "./SchemaDefinedType";


/**
 * Define an enumerated type.
 *
 */

export interface SaladEnumSchema extends EnumSchema, SchemaDefinedType {


    /**
     * Indicates that this enum inherits symbols from a base enum.
     *
     */
        extends?: string | Array<string>;

}