import {WorkflowOutputParameterModel} from "../generic/WorkflowOutputParameterModel";
import {WorkflowOutputParameter} from "../../mappings/d2sb/WorkflowOutputParameter";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {
    commaSeparatedToArray, ensureArray, spreadAllProps,
    spreadSelectProps
} from "../helpers/utils";
import {EventHub} from "../helpers/EventHub";
import {Expression} from "../../mappings/v1.0";
import {V1ExpressionModel} from "../v1.0/V1ExpressionModel";
import {ExpressionModel} from "../generic/ExpressionModel";
import {SBGWorkflowInputParameter} from "../../mappings/d2sb/SBGWorkflowInputParameter";

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
        if (this.fileTypes.length) base["sbg:fileTypes"] = this.fileTypes.join(", ");

        if (this.secondaryFiles && this.secondaryFiles.length) {
            (base as SBGWorkflowInputParameter).secondaryFiles = this.secondaryFiles.map(f => f.serialize()).filter(f => !!f);
        }

        return spreadAllProps(base, this.customProps);
    }

    deserialize(output: WorkflowOutputParameter): void {
        const serializedKeys = ["id", "type", "source", "label", "description", "sbg:fileTypes", "secondaryFiles"];

        if (output.id && output.id.charAt(0) === "#") {
            this.id = output.id.substr(1);
        } else {
            this.id = output.id || ""; // for record fields
        }

        this.source      = ensureArray(output.source);
        this.type        = new ParameterTypeModel(output.type, SBDraft2WorkflowOutputParameterModel, `${this.id}_field`, `${this.loc}.type`, this.eventHub);
        this._label      = output.label;
        this.description = output.description;
        this.fileTypes   = commaSeparatedToArray(output["sbg:fileTypes"]);

        this.secondaryFiles = ensureArray((<WorkflowOutputParameter> output).secondaryFiles).map(f => this.addSecondaryFile(f));

        this.attachFileTypeListeners();

        spreadSelectProps(output, this.customProps, serializedKeys);
    }


    addSecondaryFile(file: Expression | string): ExpressionModel {
        return this._addSecondaryFile(file, V1ExpressionModel, `${this.loc}`);
    }

    updateSecondaryFiles(files: Array<Expression | string>) {
        this._updateSecondaryFiles(files);
    }

    removeSecondaryFile(index: number) {
        this._removeSecondaryFile(index);
    }
}