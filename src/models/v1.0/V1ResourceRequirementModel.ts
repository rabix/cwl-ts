import {ResourceRequirement} from "../../mappings/v1.0/ResourceRequirement";
import {ResourceRequirementModel} from "../generic/ResourceRequirementModel";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {returnNumIfNum, spreadAllProps, spreadSelectProps} from "../helpers/utils";
import {EventHub} from "../helpers/EventHub";

export class V1ResourceRequirementModel extends ResourceRequirementModel {
    class = "ResourceRequirement";

    mem: V1ExpressionModel;
    cores: V1ExpressionModel;

    constructor(req?: ResourceRequirement, loc?: string, eventHub?: EventHub) {
        super(loc, eventHub);

        this.mem   = new V1ExpressionModel("", `${this.loc}.ramMin`, this.eventHub);
        this.mem.setValidationCallback(err => this.updateValidity(err));
        this.cores = new V1ExpressionModel("", `${this.loc}.coresMin`, this.eventHub);
        this.cores.setValidationCallback(err => this.updateValidity(err));

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
        mem   = returnNumIfNum(mem);
        cores = returnNumIfNum(cores);

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
            this.mem = new V1ExpressionModel(<string> attr.ramMin.toString(), `${this.loc}.ramMin`, this.eventHub);
            this.mem.setValidationCallback(err => this.updateValidity(err));
        }

        if (attr.coresMin !== undefined && attr.coresMin !== null) {
            this.cores = new V1ExpressionModel(<string> attr.coresMin.toString(), `${this.loc}.coresMin`, this.eventHub);
            this.cores.setValidationCallback(err => this.updateValidity(err));
        }

        spreadSelectProps(attr, this.customProps, ["class", "ramMin", "coresMin"]);
    }

    validate(context): Promise<any> {
        return Promise.all([this.mem.validate(context), this.cores.validate(context)]);
    }
}
