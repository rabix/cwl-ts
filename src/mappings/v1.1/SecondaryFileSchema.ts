import {Expression} from "../v1.0";

export interface SecondaryFileSchema {

    /**
     * Provides a pattern or expression specifying files or directories that should be included alongside the
     * primary file.
     */
    pattern: string | Expression;

    /**
     *     An implementation must not fail workflow execution if required is set to false and the expected secondary
     *     file does not exist. Default value for required field is true for secondary files on input and false for
     *     secondary files on output.

     */
    required: boolean | Expression;
}
