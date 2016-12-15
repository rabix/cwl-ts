import {ProcessRequirementModel} from "./ProcessRequirementModel";
import {
    ExpressionEngineRequirement,
    ExpressionEngineRequirementClass
} from "../../mappings/d2sb/ExpressionEngineRequirement";
import {Serializable} from "../interfaces/Serializable";
import {ProcessRequirement} from "../../mappings/d2sb/ProcessRequirement";
import {RequirementBaseModel} from "./RequirementBaseModel";

export class ExpressionEngineRequirementModel extends ProcessRequirementModel implements Serializable<ExpressionEngineRequirement> {
    public class: ExpressionEngineRequirementClass                = "ExpressionEngineRequirement";
    public requirements?: {[id: string]: ProcessRequirementModel} = {};

    constructor(req?: ExpressionEngineRequirement, loc?: string) {
        super(req, loc);
        this.deserialize(req);
    }

    customProps: any = {};

    serialize(): ExpressionEngineRequirement {
        let base   = <ExpressionEngineRequirement> {};
        base.class = "ExpressionEngineRequirement";

        if (Object.keys(this.requirements).length) {
            base.requirements = Object.keys(this.requirements).map(key => this.requirements[key].serialize());
        }

        return Object.assign({}, base, this.customProps);
    }

    deserialize(attr: ExpressionEngineRequirement): void {
        const serializedKeys = ["class", "requirements"];
        this.class           = "ExpressionEngineRequirement";

        if (attr.requirements) {
            attr.requirements.forEach((req: ProcessRequirement, index) => {
                this.requirements[req.class] = new RequirementBaseModel(req, `${this.loc}.requirements[${index}]`);
            });
        }

        Object.keys(attr).forEach(key => {
            if (serializedKeys.indexOf(key) === -1) {
                this.customProps[key] = attr[key];
            }
        })
    }

}