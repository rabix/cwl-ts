import {ValidationBase} from "../helpers/validation/ValidationBase";
import {CommandInputParameterModel} from "./CommandInputParameterModel";
import {CommandOutputParameterModel} from "./CommandOutputParameterModel";
import {ExpressionModel} from "./ExpressionModel";
import {Serializable} from "../interfaces/Serializable";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {CWLVersion} from "../../mappings/v1.0/CWLVersion";

export abstract class CommandLineToolModel extends ValidationBase implements Serializable<any>{
    id: string;

    cwlVersion: string | CWLVersion;

    "class" = "CommandLineTool";

    baseCommand: ExpressionModel[] = [];
    inputs: CommandInputParameterModel[] = [];
    outputs: CommandOutputParameterModel[] = [];

    customProps: any = {};

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
}