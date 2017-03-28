import {CWLVersion} from "../../mappings/v1.0/CWLVersion";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {CommandArgumentModel} from "./CommandArgumentModel";
import {CommandInputParameterModel} from "./CommandInputParameterModel";
import {CommandOutputParameterModel} from "./CommandOutputParameterModel";
import {CreateFileRequirementModel} from "./CreateFileRequirementModel";
import {DockerRequirementModel} from "./DockerRequirementModel";
import {ExpressionModel} from "./ExpressionModel";
import {ProcessRequirement} from "./ProcessRequirement";
import {ProcessRequirementModel} from "./ProcessRequirementModel";
import {RequirementBaseModel} from "./RequirementBaseModel";
import {ResourceRequirementModel} from "./ResourceRequirementModel";

export abstract class CommandLineToolModel extends ValidationBase implements Serializable<any> {
    public id: string;

    public cwlVersion: string | CWLVersion;

    public "class" = "CommandLineTool";

    public context: any;

    public job: any;

    public baseCommand: ExpressionModel[]         = [];
    public inputs: CommandInputParameterModel[]   = [];
    public outputs: CommandOutputParameterModel[] = [];

    public arguments: CommandArgumentModel[] = [];

    public docker: DockerRequirementModel;

    public requirements: Array<ProcessRequirementModel> = [];
    public hints: Array<ProcessRequirementModel>        = [];

    public stdin: ExpressionModel;
    public stdout: ExpressionModel;
    public stderr: ExpressionModel;
    public hasStdErr: boolean;

    public fileRequirement: CreateFileRequirementModel;

    public resources: ResourceRequirementModel;

    public label?: string;
    public description?: string;

    public customProps: any = {};

    public addHint(hint?: ProcessRequirement | any): RequirementBaseModel {
        new UnimplementedMethodException("addHint", "CommandLineToolModel");
        return null;
    }

    public updateStream(stream: ExpressionModel, type: "stderr" | "stdin" | "stdout") {
        new UnimplementedMethodException("updateStream", "CommandLineToolModel");
    }

    public addOutput(output?): CommandOutputParameterModel {
        new UnimplementedMethodException("addOutput", "CommandLineToolModel");
        return null;
    }

    public addInput(input?): CommandInputParameterModel {
        new UnimplementedMethodException("addInput", "CommandLineToolModel");
        return null;
    }

    public addArgument(arg?): CommandArgumentModel {
        new UnimplementedMethodException("addArgument", "CommandLineToolModel");
        return null;
    }

    public addBaseCommand(cmd?): ExpressionModel {
        new UnimplementedMethodException("addBaseCommand", "CommandLineToolModel");
        return null;
    }

    public validate(): void {
        new UnimplementedMethodException("validate", "CommandLineToolModel");
    }

    public updateCommandLine(): void {
        new UnimplementedMethodException("updateCommandLine", "CommandLineToolModel");
    }

    public setJob(job: any): void {
        new UnimplementedMethodException("setJob", "CommandLineToolModel");
    }

    public resetJobDefaults(): void {
        new UnimplementedMethodException("resetJob", "CommandLineToolModel");
    }

    public serialize(): any {
        new UnimplementedMethodException("serialize", "CommandLineToolModel");
    }

    public deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize", "CommandLineToolModel");
    }

    public onCommandLineResult(fn: Function): void {
        new UnimplementedMethodException("onCommandLineResult", "CommandLineToolModel");
    }

    public setRequirement(req: ProcessRequirement, hint?: boolean) {
        new UnimplementedMethodException("setRequirement", "CommandLineToolModel");
    }

}
