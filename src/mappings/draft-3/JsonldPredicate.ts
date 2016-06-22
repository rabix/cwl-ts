/**
 * Attached to a record field to define how the parent record field is handled for
 * URI resolution and JSON-LD context generation.
 *
 */

export interface JsonldPredicate {


    /**
     * The predicate URI that this field corresponds to.
     * Corresponds to JSON-LD `@id` directive.
     *
     */
    _id?: string;


    /**
     * The context type hint, corresponds to JSON-LD `@type` directive.
     *
     * * If the value of this field is `@id` and `identity` is false or
     * unspecified, the parent field must be resolved using the link
     * resolution rules.  If `identity` is true, the parent field must be
     * resolved using the identifier expansion rules.
     *
     * * If the value of this field is `@vocab`, the parent field must be
     *   resolved using the vocabulary resolution rules.
     *
     */
    _type?: string;


    /**
     * Structure hint, corresponds to JSON-LD `@container` directive.
     *
     */
    _container?: string;


    /**
     * If true and `_type` is `@id` this indicates that the parent field must
     * be resolved according to identity resolution rules instead of link
     * resolution rules.  In addition, the field value is considered an
     * assertion that the linked value exists; absence of an object in the loaded document
     * with the URI is not an error.
     *
     */
    identity?: boolean;


    /**
     * If true, this indicates that link validation traversal must stop at
     * this field.  This field (it is is a URI) or any fields under it (if it
     * is an object or array) are not subject to link checking.
     *
     */
    noLinkCheck?: boolean;

}