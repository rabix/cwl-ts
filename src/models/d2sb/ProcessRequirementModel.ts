import {ValidationBase} from "../helpers/validation/ValidationBase";
import {ProcessRequirement} from "../../mappings/d2sb/ProcessRequirement";
import {Serializable} from "../interfaces/Serializable";

export abstract class ProcessRequirementModel extends ValidationBase implements Serializable<ProcessRequirement> {
    class: string;

    constructor(req: ProcessRequirement, loc: string) {
       super(loc);
    }

    serialize(): ProcessRequirement {
        return null;
    }

    deserialize(attr: ProcessRequirement): void {
    }

    customProps: any;
}