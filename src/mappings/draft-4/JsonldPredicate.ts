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


    /**
     * If the value of the field is a JSON object, it must be transformed
     * into an array of JSON objects, where each key-value pair from the
     * source JSON object is a list item, the list items must be JSON objects,
     * and the key is assigned to the field specified by `mapSubject`.
     *
     */
    mapSubject?: string;


    /**
     * Only applies if `mapSubject` is also provided.  If the value of the
     * field is a JSON object, it is transformed as described in `mapSubject`,
     * with the addition that when the value of a map item is not an object,
     * the item is transformed to a JSON object with the key assigned to the
     * field specified by `mapSubject` and the value assigned to the field
     * specified by `mapPredicate`.
     *
     */
    mapPredicate?: string;


    /**
     * If the field contains a relative reference, it must be resolved by
     * searching for valid document references in each successive parent scope
     * in the document fragment.  For example, a reference of `foo` in the
     * context `#foo/bar/baz` will first check for the existence of
     * `#foo/bar/baz/foo`, followed by `#foo/bar/foo`, then `#foo/foo` and
     * then finally `#foo`.  The first valid URI in the search order shall be
     * used as the fully resolved value of the identifier.  The value of the
     * refScope field is the specified number of levels from the containing
     * identifer scope before starting the search, so if `refScope: 2` then
     * "baz" and "bar" must be stripped to get the base `#foo` and search
     * `#foo/foo` and the `#foo`.  The last scope searched must be the top
     * level scope before determining if the identifier cannot be resolved.
     *
     */
    refScope?: int;


    /**
     * Field must be expanded based on the the Schema Salad type DSL.
     *
     */
    typeDSL?: boolean;

}