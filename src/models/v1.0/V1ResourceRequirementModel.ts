import {ResourceRequirement} from "../../mappings/v1.0/ResourceRequirement";
import {ResourceRequirementModel} from "../generic/ResourceRequirementModel";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {spreadAllProps, spreadSelectProps} from "../helpers/utils";

export class V1ResourceRequirementModel extends ResourceRequirementModel {
    class = "ResourceRequirement";

    mem: V1ExpressionModel;
    cores: V1ExpressionModel;

    constructor(req?: ResourceRequirement, loc?: string) {
        super(loc);

        this.mem   = new V1ExpressionModel("", `${this.loc}.ramMin`);
        this.cores = new V1ExpressionModel("", `${this.loc}.coresMin`);

        if (req) this.deserialize(req);
    }

    serialize(): ResourceRequirement {
        let mem: string | number   = this.mem.serialize();
        let cores: string | number = this.cores.serialize();

        // in case neither mem nor cores have been defined, and no custom props were specified
        if (mem === undefined && cores === undefined && !Object.keys(this.customProps).length) {
            // indicate that there is nothing to serialize
            return undefined;
        }

        // mem and cores were cast to string during serialization, turn back to numbers if applicable
        mem   = isNaN(<any> mem) ? mem : parseInt(mem);
        cores = isNaN(<any> cores) ? cores : parseInt(cores);

        const base: ResourceRequirement = {
            "class": "ResourceRequirement"
        };

        if (mem !== undefined) base.ramMin = mem;
        if (cores !== undefined) base.coresMin = cores;

        return spreadAllProps(base, this.customProps);
    }

    deserialize(attr: ResourceRequirement): void {
        //@todo cover maximum values
        if (attr.ramMin !== undefined && attr.ramMin !== null) {
            this.mem = new V1ExpressionModel(<string> attr.ramMin.toString(), `${this.loc}.ramMin`);
        }

        if (attr.coresMin !== undefined && attr.coresMin !== null) {
            this.cores = new V1ExpressionModel(<string> attr.coresMin.toString(), `${this.loc}.coresMin`);
        }

        spreadSelectProps(attr, this.customProps, ["class", "ramMin", "coresMin"]);
    }
}
