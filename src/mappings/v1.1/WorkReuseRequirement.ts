import {Expression, ProcessRequirement} from "../v1.0";

/**
 *
 * For implementations that support reusing output from past work (on the assumption that same code and same input
 * produce same results), control whether to enable or disable the reuse behavior for a particular tool or step
 * (to accomodate situations where that assumption is incorrect). A reused step is not executed but instead returns
 * the same output as the original execution. If enableReuse is not specified, correct tools should assume it is
 * enabled by default.
 */
export class WorkReuseRequirement implements ProcessRequirement {

    /**
     * Always 'WorkReuse'
     */
    class: string;

    /**
     * The time limit, in seconds. A time limit of zero means no time limit. Negative time limits are an error.
     */
    enableReuse?: boolean | Expression;

}
