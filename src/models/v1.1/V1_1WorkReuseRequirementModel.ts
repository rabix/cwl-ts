import {ExpressionModel} from "../generic/ExpressionModel";
import {ProcessRequirementModel} from "../generic/ProcessRequirementModel";
import {Expression} from "../../mappings/v1.0/Expression";
import {WorkReuseRequirement} from "../../mappings/v1.1/WorkReuseRequirement";
import {V1ExpressionModel} from "../v1.0/V1ExpressionModel";
import {EventHub} from "../helpers/EventHub";
import {spreadAllProps, spreadSelectProps} from "../helpers";

export class V1_1WorkReuseRequirementModel extends ProcessRequirementModel {

    class = "WorkReuse";

    enableReuse: boolean | V1ExpressionModel = true;

    customProps: any;

    constructor(req?: WorkReuseRequirement, loc?: string, protected eventHub?: EventHub) {
        super(loc);

        if (req) this.deserialize(req);
    }

    deserialize(attr: WorkReuseRequirement) {

        const enableReuse = attr.enableReuse;

        if (typeof enableReuse === 'string') {
            this.enableReuse = new V1ExpressionModel(enableReuse, `${this.loc}.enableReuse`, this.eventHub);
            this.enableReuse.setValidationCallback(err => this.updateValidity(err));
        } else {
            this.enableReuse = (enableReuse === null || enableReuse === undefined) ? true : !!enableReuse;
        }


        spreadSelectProps(attr, this.customProps, ["class", "enableReuse"]);
    }

    serialize(): WorkReuseRequirement {

        let base: WorkReuseRequirement = <any>{};

        base.class = this.class;

        base.enableReuse =
            (this.enableReuse instanceof ExpressionModel)
                ? (<Expression>this.enableReuse.serialize() || true) : !!this.enableReuse;

        if (base.enableReuse === true) {
            return undefined;
        }

        return spreadAllProps(base, this.customProps);

    }

}
