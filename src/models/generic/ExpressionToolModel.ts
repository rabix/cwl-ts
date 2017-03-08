import {Serializable} from "../interfaces/Serializable";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {CWLVersion} from "../../mappings/v1.0/CWLVersion";
import {InputParameterModel} from "./InputParameterModel";

export abstract class ExpressionToolModel implements Serializable<any> {
    id: string;
    customProps: any = {};
    cwlVersion: CWLVersion;

    label?: string;
    description?: string;

    serialize(): any {
        new UnimplementedMethodException("serialize");
    }

    deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize");
    }
    inputs: InputParameterModel[];
    outputs: any[];
}