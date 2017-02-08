import {ValidationBase} from "../helpers/validation/ValidationBase";
import {CommandInputParameterModel} from "./CommandInputParameterModel";
import {CommandOutputParameterModel} from "./CommandOutputParameterModel";
import {ExpressionModel} from "./ExpressionModel";

export class CommandLineToolModel extends ValidationBase {
    baseCommand: ExpressionModel[] = [];
    inputs: CommandInputParameterModel[] = [];
    outputs: CommandOutputParameterModel[] = [];
}