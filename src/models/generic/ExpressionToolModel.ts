import {InputParameter} from "./InputParameter";
import {Serializable} from "../interfaces/Serializable";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";

export abstract class ExpressionToolModel implements Serializable<any> {
    customProps: any = {};

    serialize(): any {
        throw new UnimplementedMethodException("serialize");
    }

    deserialize(attr: any): void {
        throw new UnimplementedMethodException("deserialize");
    }
    inputs: InputParameter[];
    outputs: any[];
}