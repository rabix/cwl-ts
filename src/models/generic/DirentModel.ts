import {ValidationBase} from "../helpers/validation/ValidationBase";
import {ExpressionModel} from "./ExpressionModel";
import {Serializable} from "../interfaces/Serializable";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";

export abstract class DirentModel extends ValidationBase implements Serializable<any> {
    entry: ExpressionModel;
    entryName: ExpressionModel;

    customProps: any = {};

    serialize(): any {
        new UnimplementedMethodException("serialize",  "DirentModel");
        return null;
    }

    deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize",  "DirentModel");
    }
}