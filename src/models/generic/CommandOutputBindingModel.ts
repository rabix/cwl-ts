import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {ExpressionModel} from "./ExpressionModel";

export class CommandOutputBindingModel extends ValidationBase implements Serializable<any> {
    hasSecondaryFiles: boolean;
    hasMetadata: boolean;
    hasInheritMetadata: boolean;

    secondaryFiles: ExpressionModel[];

    glob: ExpressionModel;

    loadContents: boolean;

    outputEval: ExpressionModel;

    customProps: any = {};

    serialize(): any {
        new UnimplementedMethodException("serialize", "CommandOutputBindingModel");
        return undefined;
    }

    deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize", "CommandOutputBindingModel");
    }
}