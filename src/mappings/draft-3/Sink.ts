import {LinkMergeMethod} from "./LinkMergeMethod";


export interface Sink {


    /**
     * Specifies one or more workflow parameters that will provide input to
     * the underlying process parameter.
     *
     */
    source?: string | Array<string>;


    /**
     * The method to use to merge multiple inbound links into a single array.
     * If not specified, the default method is "merge_nested".
     *
     */
    linkMerge?: LinkMergeMethod;

}