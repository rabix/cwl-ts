import {WorkflowStepInput} from "../../mappings/v1.0";
import {PickValue} from "../elements/pick-value-method";
import {V1_1WorkflowStepInputModel} from "../v1.1/V1_1WorkflowStepInputModel";

export class V1_2WorkflowStepInputModel extends V1_1WorkflowStepInputModel {

    pickValue: PickValue;

    serialize(): WorkflowStepInput {

        const base: any = super.serialize();

        (base.pickValue = this.pickValue.serialize()) || delete base.pickValue;

        return base;

    }

    deserialize(attr: WorkflowStepInput): void {

        super.deserialize(attr);

        this.pickValue = new PickValue((attr as any).pickValue);

    }

}
