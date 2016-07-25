import {DocType} from "./DocType";
import {JsonldPredicate} from "./JsonldPredicate";


/**
 * Abstract base for schema-defined types.
 *
 */

export interface SchemaDefinedType extends DocType {


    /**
     * Annotate this type with linked data context.
     *
     */
    jsonldPredicate?: string | JsonldPredicate;


    /**
     * If true, indicates that the type is a valid at the document root.  At
     * least one type in a schema must be tagged with `documentRoot: true`.
     *
     */
    documentRoot?: boolean;

}