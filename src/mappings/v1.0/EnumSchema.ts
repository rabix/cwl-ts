/**
 * Define an enumerated type.
 *
 */

export interface EnumSchema {


    /**
     * Must be `enum`
     */
        type: "enum";


    /**
     * Defines the set of valid symbols.
     */
    symbols: string[];

}