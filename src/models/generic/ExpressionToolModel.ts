import {InputParameter} from "./InputParameter";
import {Serializable} from "../interfaces/Serializable";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";

export abstract class ExpressionToolModel implements Serializable<any> {
    customProps: any = {};

    serialize(): any {
        new UnimplementedMethodException("serialize");
    }

    deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize");
    }
    inputs: InputParameter[];
    outputs: any[];
}