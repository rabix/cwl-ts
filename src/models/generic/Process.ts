import {CWLVersion} from "../../mappings/v1.0/CWLVersion";
import {ProcessRequirement} from "./ProcessRequirement";
import {InputParameter} from "./InputParameter";
import {OutputParameter} from "./OutputParameter";

export interface Process {
    id?: string;
    cwlVersion: CWLVersion | string;
    inputs: InputParameter[];
    outputs: OutputParameter[];
    class: "ExpressionTool" | "Workflow" | "CommandLineTool";

    requirements?: Array<ProcessRequirement>;

    /**
     * Declares hints applying to either the runtime environment or the
     * workflow engine that may be helpful in executing this process.  It is
     * not an error if an implementation cannot satisfy all hints, however
     * the implementation may report a warning.
     *
     */
    hints?: Array<any>;


    /**
     * A short, human-readable label of this process object.
     */
    label?: string;


    /**
     * A long, human-readable description of this process object.
     */
    description?: string;

    doc?: string;

}