import {WorkflowOutputParameterModel} from "../generic/WorkflowOutputParameterModel";
import {WorkflowOutputParameter} from "../../mappings/d2sb/WorkflowOutputParameter";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {ensureArray, spreadAllProps, spreadSelectProps} from "../helpers/utils";

export class SBDraft2WorkflowOutputParameterModel extends WorkflowOutputParameterModel {

    constructor(attr: WorkflowOutputParameter, loc?: string) {
        super(loc);

        if (attr) this.deserialize(attr);
    }

    public get destinationId(): string {
        return "#" + this.id;
    }

    serialize(): WorkflowOutputParameter {
        const base: any = {};

        base.id = "#" + this.id;

        if (this.label) base.label = this.label;
        if (this.description) base.description = this.description;

        base.source = this.source;
        if (this.type) base.type = this.type.serialize();

        return spreadAllProps(base, this.customProps);
    }

    deserialize(output: WorkflowOutputParameter): void {
        const serializedKeys = ["id", "type", "source", "label", "description"];

        if (output.id && output.id.charAt(0) === "#") {
            this.id = output.id.substr(1);
        } else {
            this.id = output.id || ""; // for record fields
        }

        this.source      = ensureArray(output.source);
        this.type        = new ParameterTypeModel(output.type, SBDraft2WorkflowOutputParameterModel, `${this.loc}.type`);
        this.label       = output.label;
        this.description = output.description;

        spreadSelectProps(output, this.customProps, serializedKeys);
    }
}