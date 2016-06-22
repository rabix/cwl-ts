import {Expression} from "./Expression";


/**
 * Define an environment variable that will be set in the runtime environment
 * by the workflow platform when executing the command line tool.  May be the
 * result of executing an expression, such as getting a parameter from input.
 *
 */

export interface EnvironmentDef {


    /**
     * The environment variable name
     */
    envName: string;


    /**
     * The environment variable value
     */
    envValue: string | Expression;

}