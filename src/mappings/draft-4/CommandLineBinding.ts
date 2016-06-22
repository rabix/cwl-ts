import {InputBinding} from "./InputBinding";
import {Expression} from "./Expression";


/**
 *
 * When listed under `inputBinding` in the input schema, the term
 * "value" refers to the the corresponding value in the input object.  For
 * binding objects listed in `CommandLineTool.arguments`, the term "value"
 * refers to the effective value after evaluating `valueFrom`.
 *
 * The binding behavior when building the command line depends on the data
 * type of the value.  If there is a mismatch between the type described by
 * the input schema and the effective value, such as resulting from an
 * expression evaluation, an implementation must use the data type of the
 * effective value.
 *
 *   - **string**: Add `prefix` and the string to the command line.
 *
 *   - **number**: Add `prefix` and decimal representation to command line.
 *
 *   - **boolean**: If true, add `prefix` to the command line.  If false, add
 *       nothing.
 *
 *   - **File**: Add `prefix` and the value of
 *     [`File.path`](#File) to the command line.
 *
 *   - **array**: If `itemSeparator` is specified, add `prefix` and the join
 *       the array into a single string with `itemSeparator` separating the
 *       items.  Otherwise first add `prefix`, then recursively process
 *       individual elements.
 *
 *   - **object**: Add `prefix` only, and recursively add object fields for
 *       which `inputBinding` is specified.
 *
 *   - **null**: Add nothing.
 *
 */

export interface CommandLineBinding extends InputBinding {


    /**
     * The sorting key.  Default position is 0.
     */
    position?: number;


    /**
     * Command line prefix to add before the value.
     */
    prefix?: string;


    /**
     * If true (default), then the prefix and value must be added as separate
     * command line arguments; if false, prefix and value must be concatenated
     * into a single command line argument.
     *
     */
    separate?: boolean;


    /**
     * Join the array elements into a single string with the elements
     * separated by by `itemSeparator`.
     *
     */
    itemSeparator?: string;


    /**
     * If `valueFrom` is a constant string value, use this as the value and
     * apply the binding rules above.
     *
     * If `valueFrom` is an expression, evaluate the expression to yield the
     * actual value to use to build the command line and apply the binding
     * rules above.  If the inputBinding is associated with an input
     * parameter, the value of `self` in the expression will be the value of the
     * input parameter.
     *
     * When a binding is part of the `CommandLineTool.arguments` field,
     * the `valueFrom` field is required.
     *
     */
    valueFrom?: string | Expression;


    /**
     * If `ShellCommandRequirement` is in the requirements for the current command,
     * this controls whether the value is quoted on the command line (default is true).
     * Use `shellQuote: false` to inject metacharacters for operations such as pipes.
     *
     */
    shellQuote?: boolean;

}