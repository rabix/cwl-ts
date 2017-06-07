import {WorkflowOutputParameterModel} from "../generic/WorkflowOutputParameterModel";
import {WorkflowOutputParameter} from "../../mappings/d2sb/WorkflowOutputParameter";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {ensureArray, spreadAllProps, spreadSelectProps} from "../helpers/utils";
import {EventHub} from "../helpers/EventHub";

export class SBDraft2WorkflowOutputParameterModel extends WorkflowOutputParameterModel {

    constructor(attr: WorkflowOutputParameter, loc?: string, eventHub?: EventHub) {
        super(loc, eventHub);

        if (attr) this.deserialize(attr);
    }

    public get destinationId(): string {
        return "#" + this.id;
    }

    serialize(): WorkflowOutputParameter {
        const base: any = {};

        base.id = "#" + this.id;

        if (this._label) base.label = this._label;
        if (this.description) base.description = this.description;

        base.source = ensureArray(this.source);
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
        this.type        = new ParameterTypeModel(output.type, SBDraft2WorkflowOutputParameterModel, `${this.id}_field`,`${this.loc}.type`);
        this._label       = output.label;
        this.description = output.description;

        spreadSelectProps(output, this.customProps, serializedKeys);
    }
}