import {ProcessRequirementModel} from "../generic/ProcessRequirementModel";
import {InlineJavascriptRequirement} from "../../mappings/v1.0/InlineJavascriptRequirement";
import {spreadAllProps, spreadSelectProps} from "../helpers/utils";

export class V1InlineJavascriptRequirementModel extends ProcessRequirementModel {
    class                   = "InlineJavascriptRequirement";
    wasPresent              = false;
    expressionLib: string[] = [];

    constructor(req: any, loc: string) {
        super(loc);

        if (req) this.deserialize(req);
    }

    addExpressionLib(lib: string) {
        if (this.expressionLib.indexOf(lib) === -1) {
            this.expressionLib.push(lib);
        }
    }

    removeExpressionLib(lib: string) {
        const index = this.expressionLib.indexOf(lib);
        if (index !== -1) {
            this.expressionLib.splice(index, 1);
        }
    }

    deserialize(attr: InlineJavascriptRequirement) {
        this.expressionLib = attr.expressionLib || [];

        spreadSelectProps(attr, this.customProps, ["expressionLib", "class"]);
    }

    serialize(): InlineJavascriptRequirement {
        let base: InlineJavascriptRequirement = <any> {};

        base.class         = this.class;
        base.expressionLib = this.expressionLib;

        return spreadAllProps(base, this.customProps);
    }


}