import {WorkflowOutputParameter} from "../../mappings/v1.0";
import {LinkMerge} from "../elements/link-merge";
import {PickValue} from "../elements/pick-value-method";
import {V1_1WorkflowOutputParameterModel} from "../v1.1/V1_1WorkflowOutputParameterModel";

export class V1_2WorkflowOutputParameterModel extends V1_1WorkflowOutputParameterModel {

    pickValue: PickValue;

    serialize(): WorkflowOutputParameter {

        const base: any = super.serialize();

        (base.pickValue = this.pickValue.serialize()) || delete base.pickValue;

        const linkMerge = this.linkMerge && this.linkMerge.serialize();

        if (linkMerge) {
            (base as WorkflowOutputParameter).linkMerge = linkMerge;
        }

        return base;

    }

    deserialize(attr: WorkflowOutputParameter): void {

        super.deserialize(attr);

        this.linkMerge = new LinkMerge((attr).linkMerge);
        this.pickValue = new PickValue((attr as any).pickValue);

    }

}

