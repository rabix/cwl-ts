import {SchemaBase} from "./SchemaBase";
import {Expression} from "./Expression";


/**
 * Define an input or output parameter to a process.
 *
 */

export interface Parameter extends SchemaBase {


    /**
     * Only valid when `type: File` or is an array of `items: File`.
     *
     * Describes files that must be included alongside the primary file(s).
     *
     * If the value is an expression, the value of `self` in the expression
     * must be the primary input or output File to which this binding applies.
     *
     * If the value is a string, it specifies that the following pattern
     * should be applied to the primary file:
     *
     *   1. If string begins with one or more caret `^` characters, for each
     *     caret, remove the last file extension from the path (the last
     *     period `.` and all following characters).  If there are no file
     *     extensions, the path is unchanged.
     *   2. Append the remainder of the string to the end of the file path.
     *
     */
    secondaryFiles?: string | Expression | Array<string | Expression>;


    /**
     * Only valid when `type: File` or is an array of `items: File`.
     *
     * For input parameters, this must be one or more IRIs of concept nodes
     * that represents file formats which are allowed as input to this
     * parameter, preferrably defined within an ontology.  If no ontology is
     * available, file formats may be tested by exact match.
     *
     * For output parameters, this is the file format that will be assigned to
     * the output parameter.
     *
     */
    format?: string | Array<string> | Expression;


    /**
     * Only valid when `type: File` or is an array of `items: File`.
     *
     * A value of `true` indicates that the file is read or written
     * sequentially without seeking.  An implementation may use this flag to
     * indicate whether it is valid to stream file contents using a named
     * pipe.  Default: `false`.
     *
     */
    streamable?: boolean;


    /**
     * A documentation string for this type, or an array of strings which should be concatenated.
     */
    doc?: string | string[];

}