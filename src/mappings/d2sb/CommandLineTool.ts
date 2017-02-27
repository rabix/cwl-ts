import {Process} from "./Process";
import {Expression} from "./Expression";
import {CommandLineBinding} from "./CommandLineBinding";
import {CommandInputParameter} from "./CommandInputParameter";
import {CommandOutputParameter} from "./CommandOutputParameter";
import {SBGMemRequirement} from "./SBGMemRequirement";
import {SBGCPURequirement} from "./SBGCPURequirement";
import {DockerRequirement} from "./DockerRequirement";

export interface CommandLineTool extends Process {
    inputs: CommandInputParameter[];
    outputs: CommandOutputParameter[];

    hints?: Array<any |
        DockerRequirement |
        SBGCPURequirement |
        SBGMemRequirement>

    class: "CommandLineTool";
    baseCommand: string | Expression | Array<string | Expression>;
    arguments?: Array<string | CommandLineBinding>

    stdin?: string | Expression;
    stdout?: string | Expression;

    successCodes?: number[];
    temporaryFailCodes?: number[];
    permanentFailCodes?: number[];

    "sbg:job"?: any;
}