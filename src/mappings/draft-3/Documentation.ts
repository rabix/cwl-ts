import {NamedType} from "./NamedType";
import {DocType} from "./DocType";


/**
 * A documentation section.  This type exists to facilitate self-documenting
 * schemas but has no role in formal validation.
 *
 */

export interface Documentation extends NamedType, DocType {


    /**
     * Must be `documentation`
     */
        type: "documentation";

}