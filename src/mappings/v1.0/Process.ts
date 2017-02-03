import {InputParameter} from "./InputParameter";
import {OutputParameter} from "./OutputParameter";
import {ProcessRequirement} from "./ProcessRequirement";
import {CWLVersion} from "./CWLVersion";


/**
 *
 * The base executable type in CWL is the `Process` object defined by the
 * document.  Note that the `Process` object is abstract and cannot be
 * directly executed.
 *
 */

export interface Process {

    "class"?: string;


    /**
     * The unique identifier for this process object.
     */
    id?: string;


    /**
     * Defines the input parameters of the process.  The process is ready to
     * run when all required input parameters are associated with concrete
     * values.  Input parameters include a schema for each parameter which is
     * used to validate the input object.  It may also be used to build a user
     * interface for constructing the input object.
     *
     */
    inputs: Array<InputParameter>;


    /**
     * Defines the parameters representing the output of the process.  May be
     * used to generate and/or validate the output object.
     *
     */
    outputs: Array<OutputParameter>;


    /**
     * Declares requirements that apply to either the runtime environment or the
     * workflow engine that must be met in order to execute this process.  If
     * an implementation cannot satisfy all requirements, or a requirement is
     * listed which is not recognized by the implementation, it is a fatal
     * error and the implementation must not attempt to run the process,
     * unless overridden at user option.
     *
     */
    requirements?: ProcessRequirement[];


    /**
     * Declares hints applying to either the runtime environment or the
     * workflow engine that may be helpful in executing this process.  It is
     * not an error if an implementation cannot satisfy all hints, however
     * the implementation may report a warning.
     *
     */
    hints?: any[];


    /**
     * A short, human-readable label of this process object.
     */
    label?: string;


    /**
     * A long, human-readable description of this process object.
     */
    doc?: string;


    /**
     * CWL document version. Always required at the document root. Not
     * required for a Process embedded inside another Process.
     *
     */
    cwlVersion?: CWLVersion;

}