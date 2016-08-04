import {ProcessRequirement} from "./ProcessRequirement";
import {InputSchema} from "./InputSchema";


/**
 * This field consists of an array of type definitions which must be used when
 * interpreting the `inputs` and `outputs` fields.  When a `type` field
 * contain a IRI, the implementation must check if the type is defined in
 * `schemaDefs` and use that definition.  If the type is not found in
 * `schemaDefs`, it is an error.  The entries in `schemaDefs` must be
 * processed in the order listed such that later schema definitions may refer
 * to earlier schema definitions.
 *
 */

export interface SchemaDefRequirement extends ProcessRequirement {


    /**
     * Always 'SchemaDefRequirement'
     */
        class: string;


    /**
     * The list of type definitions.
     */
    types: Array<InputSchema>;

}