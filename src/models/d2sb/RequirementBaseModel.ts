import {ProcessRequirement} from "../../mappings/d2sb/ProcessRequirement";
import {ProcessRequirementModel} from "./ProcessRequirementModel";
import {Serializable} from "../interfaces/Serializable";

export class RequirementBaseModel extends ProcessRequirementModel implements Serializable<ProcessRequirement> {
    'class': string;
    value?: any;

    constructor(req: ProcessRequirement, loc: string) {
        super(req, loc);
        this.deserialize(req);
    }

    customProps: any = {};

    serialize(): ProcessRequirement {
        let base = <ProcessRequirement>{};
        if (this.class) base.class = this.class;
        if (this.value) base["value"] = this.value;

        return Object.assign({}, base, this.customProps);
    }

    deserialize(attr: ProcessRequirement): void {
        this.class = attr.class;
        this.value = attr["value"];

        Object.keys(attr).forEach(key => {
            if (key !== "class" && key !== "value") {
                this.customProps[key] = attr[key];
            }
        });
    }


}