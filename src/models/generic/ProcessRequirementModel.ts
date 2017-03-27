import {ValidationBase} from "../helpers/validation/ValidationBase";
import {ProcessRequirement} from "../../mappings/d2sb/ProcessRequirement";
import {Serializable} from "../interfaces/Serializable";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";

export abstract class ProcessRequirementModel extends ValidationBase implements Serializable<ProcessRequirement> {
    class: string;
    isHint: boolean;

    constructor(loc: string) {
       super(loc);
    }

    serialize(): ProcessRequirement {
        new UnimplementedMethodException("serialize", "ProcessRequirementModel");
        return null;
    }

    deserialize(attr: ProcessRequirement): void {
        new UnimplementedMethodException("deserialize", "ProcessRequirementModel");
    }

    customProps: any = {};
}