import {V1WorkflowStepInputModel} from "../v1.0/V1WorkflowStepInputModel";
import {WorkflowStepInput} from "../../mappings/v1.0";
import {isType} from "../helpers";
import {LoadListing} from "../elements/load-listing";

export class V1_1WorkflowStepInputModel extends V1WorkflowStepInputModel {

    loadListing: LoadListing;

    serialize(): WorkflowStepInput {

        const base = super.serialize();

        const isDirectory = isType(this, ['Directory']);

        if (isDirectory) {
            base["loadListing"] = `${this.loadListing}`;
        } else {
            delete base["loadListing"];
        }

        return base;

    }

    deserialize(attr: WorkflowStepInput): void {

        super.deserialize(attr);

        const isDirectory = isType(this, ['Directory']);

        if (isDirectory) {
            this.loadListing = new LoadListing(attr["loadListing"]);
        }

    }

}
