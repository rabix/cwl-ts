import {Expression} from "../expression";
export interface CommandLineBinding {
    /**
     * Only valid when type: File or is an array of items: File.
     *
     * Read up to the first 64 KiB of text from the file and place it in the "contents"
     * field of the file object for use by expressions.
     */
    loadContents?: boolean;

    /**
     * The sorting key. Default position is 0.
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
     */
    separate?: boolean;

    /**
     * Join the array elements into a single string with the elements
     * separated by by itemSeparator.
     */
    itemSeparator?: string;

    /**
     * If valueFrom is a constant string value, use this as
     * the value and apply the binding rules above.
     *
     * If valueFrom is an expression, evaluate the expression to yield
     * the actual value to use to build the command line and apply the binding rules above.
     * If the inputBinding is associated with an input parameter, the value of self in
     * the expression will be the value of the input parameter.
     *
     * When a binding is part of the CommandLineTool.arguments field,
     * the valueFrom field is required.
     */
    valueFrom?: string | Expression;

    /**
     * If ShellCommandRequirement is in the requirements for the current command,
     * this controls whether the value is quoted on the command line (default is true).
     * Use shellQuote: false to inject metacharacters for operations such as pipes.
     */
    shellQuote?: boolean;
}