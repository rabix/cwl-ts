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

    serialize(): any {
        throw new UnimplementedMethodException("serialize");
    }

    deserialize(attr: any): void {
        throw new UnimplementedMethodException("deserialize");
    }
}