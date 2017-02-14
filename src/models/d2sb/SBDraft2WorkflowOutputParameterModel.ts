import {WorkflowOutputParameterModel} from "../generic/WorkflowOutputParameterModel";
import {WorkflowOutputParameter} from "../../mappings/d2sb/WorkflowOutputParameter";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {ensureArray} from "../helpers/utils";

export class SBDraft2WorkflowOutputParameterModel extends WorkflowOutputParameterModel {

    constructor(attr: WorkflowOutputParameter, loc?: string) {
        super(loc);

        if (attr) this.deserialize(attr);
    }

    customProps: any = {};

    serialize(): WorkflowOutputParameter {
        return undefined;
    }

    deserialize(output: WorkflowOutputParameter): void {
        if (output.id && output.id.charAt(0) === "#") {
            this.id = output.id.substr(1);
        } else {
            this.id = output.id || ""; // for record fields
        }

        this.source      = ensureArray(output.source);
        this.type        = new ParameterTypeModel(output.type, SBDraft2WorkflowOutputParameterModel, `${this.loc}.type`);
        this.label       = output.label;
        this.description = output.description;
    }
}