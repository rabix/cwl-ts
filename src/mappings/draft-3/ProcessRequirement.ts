/**
 * A process requirement declares a prerequisite that may or must be fulfilled
 * before executing a process.  See [`Process.hints`](#process) and
 * [`Process.requirements`](#process).
 *
 * Process requirements are the primary mechanism for specifying extensions to
 * the CWL core specification.
 *
 */

export interface ProcessRequirement {


    /**
     * The specific requirement type.
     */
        class: string;

}