import {WorkflowInputParameterModel} from "../generic/WorkflowInputParameterModel";
import {SBGWorkflowInputParameter} from "../../mappings/d2sb/SBGWorkflowInputParameter";
import {RecordField} from "../../mappings/draft-3/RecordField";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {STEP_OUTPUT_CONNECTION_PREFIX} from "../helpers/constants";
import {commaSeparatedToArray, ensureArray, spreadAllProps, spreadSelectProps} from "../helpers/utils";
import {EventHub} from "../helpers/EventHub";
import {SBDraft2ExpressionModel} from "./SBDraft2ExpressionModel";
import {Expression} from "../../mappings/d2sb/Expression";
import {ExpressionModel} from "../generic/ExpressionModel";

export class SBDraft2WorkflowInputParameterModel extends WorkflowInputParameterModel {

    constructor(input?: SBGWorkflowInputParameter, loc?: string, eventHub?: EventHub) {
        super(loc, eventHub);
        if (input) this.deserialize(input);
    }

    get connectionId(): string {
        return `${STEP_OUTPUT_CONNECTION_PREFIX}${this.id}/${this.id}`;
    }

    public get sourceId(): string {
        return `#${this.id}`;
    }

    deserialize(input: SBGWorkflowInputParameter | RecordField) {
        const serializedKeys = ["name", "id", "type", "label", "description", "sbg:fileTypes", "secondaryFiles"];

        this.isField = !!(<RecordField> input).name;

        if ((<SBGWorkflowInputParameter> input).id && (<SBGWorkflowInputParameter> input).id.charAt(0) === "#") {
            this.id = (<SBGWorkflowInputParameter> input).id.substr(1);
        } else {
            this.id = (<SBGWorkflowInputParameter> input).id
                || (<RecordField> input).name || ""; // for record fields
        }

        this.type = new ParameterTypeModel(input.type, SBDraft2WorkflowInputParameterModel, `${this.id}_field`, `${this.loc}.type`, this.eventHub);
        this.type.setValidationCallback(err => {
                this.updateValidity(err)
            }
        );
        this.fileTypes   = commaSeparatedToArray(input["sbg:fileTypes"]);
        this._label       = (input as SBGWorkflowInputParameter).label;
        this.description = (input as SBGWorkflowInputParameter).description;

        // only show inputs which are type File or File[], or should be explicitly shown
        this.isVisible = this.type.type === "File" || this.type.items === "File" || !!input["sbg:includeInPorts"];

        this.secondaryFiles = ensureArray((<SBGWorkflowInputParameter> input).secondaryFiles).map(f => this.addSecondaryFile(f));

        this.attachFileTypeListeners();

        spreadSelectProps(input, this.customProps, serializedKeys);
    }

    serialize(): SBGWorkflowInputParameter | RecordField {
        const base: any = {};
        base.type       = this.type.serialize();

        if (this._label) base.label = this._label;
        if (this.description) base.description = this.description;
        if (this.fileTypes.length) base["sbg:fileTypes"] = this.fileTypes.join(", ");

        if (this.isField) {
            base.name = this.id;
        } else {
            base.id = "#" + this.id;
        }

        if (this.secondaryFiles && this.secondaryFiles.length) {
            (base as SBGWorkflowInputParameter).secondaryFiles = this.secondaryFiles.map(f => f.serialize()).filter(f => !!f);
        }

        return spreadAllProps(base, this.customProps);
    }

    addSecondaryFile(file: Expression | string): ExpressionModel {
        return this._addSecondaryFile(file, SBDraft2ExpressionModel, this.loc);
    }

    updateSecondaryFiles(files: Array<Expression | Expression | string>) {
        this._updateSecondaryFiles(files);
    }


    removeSecondaryFile(index: number) {
        this._removeSecondaryFile(index);
    }
}