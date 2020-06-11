import {ProcessRequirementModel} from "../generic/ProcessRequirementModel";

import {EventHub} from "../helpers/EventHub";
import {returnNumIfNum, spreadAllProps, spreadSelectProps} from "../helpers";
import {V1ExpressionModel} from "../v1.0";
import {ToolTimeLimitRequirement} from "../../mappings/v1.1/ToolTimeLimitRequirement";

export class V1_1ToolTimeLimitRequirementModel extends ProcessRequirementModel {

    class = "ToolTimeLimit";
    timelimit: V1ExpressionModel;

    customProps: any;

    constructor(req?: ToolTimeLimitRequirement, loc?: string, protected eventHub?: EventHub) {
        super(loc);

        if (req) this.deserialize(req);
    }

    deserialize(attr: ToolTimeLimitRequirement) {

        const timelimit = (attr.timelimit !== undefined && attr.timelimit !== null) ? attr.timelimit : '';

        this.timelimit = new V1ExpressionModel(`${timelimit}`, `${this.loc}.timelimit`, this.eventHub);
        this.timelimit.setValidationCallback(err => this.updateValidity(err));

        spreadSelectProps(attr, this.customProps, ["class", "timelimit"]);
    }

    serialize(): ToolTimeLimitRequirement {

        let base: ToolTimeLimitRequirement = <any>{};

        base.class = this.class;

        let timelimit: string | number = this.timelimit.serialize();

        if (timelimit === undefined) {
            return undefined;
        }

        // timelimit is cast to string during serialization, turn back to numbers if applicable
        base.timelimit = returnNumIfNum(timelimit);

        return spreadAllProps(base, this.customProps);
    }


}
