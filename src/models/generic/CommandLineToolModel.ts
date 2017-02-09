import {ValidationBase} from "../helpers/validation/ValidationBase";
import {CommandInputParameterModel} from "./CommandInputParameterModel";
import {CommandOutputParameterModel} from "./CommandOutputParameterModel";
import {ExpressionModel} from "./ExpressionModel";
import {Serializable} from "../interfaces/Serializable";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";

export abstract class CommandLineToolModel extends ValidationBase implements Serializable<any>{
    customProps: any = {};

    serialize(): any {
        throw new UnimplementedMethodException("serialize");
    }

    deserialize(attr: any): void {
        throw new UnimplementedMethodException("deserialize");
    }

    baseCommand: ExpressionModel[] = [];
    inputs: CommandInputParameterModel[] = [];
    outputs: CommandOutputParameterModel[] = [];
}