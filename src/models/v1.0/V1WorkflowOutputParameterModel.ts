import {WorkflowOutputParameterModel} from "../generic/WorkflowOutputParameterModel";
import {WorkflowOutputParameter} from "../../mappings/v1.0/WorkflowOutputParameter";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {
    commaSeparatedToArray, ensureArray, spreadAllProps,
    spreadSelectProps
} from "../helpers/utils";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {V1CommandOutputBindingModel} from "./V1CommandOutputBindingModel";
import {LinkMergeMethod} from "../../mappings/v1.0/LinkMergeMethod";
import {EventHub} from "../helpers/EventHub";

export class V1WorkflowOutputParameterModel extends WorkflowOutputParameterModel {
    secondaryFiles?: V1ExpressionModel[];
    linkMerge: LinkMergeMethod;
    streamable?: boolean;
    outputBinding?: V1CommandOutputBindingModel;

    constructor(output?: WorkflowOutputParameter, loc?: string, eventHub?: EventHub) {
        super(loc, eventHub);
        if (output) this.deserialize(output);
    }

    deserialize(output: WorkflowOutputParameter) {
        const serializedKeys = ["id", "outSource", "type", "label", "doc", "format"];

        //@todo deserialization of outputBinding, streamable, linkMerge, secondaryFiles

        this.id = output.id;
        this.source = ensureArray(output.outputSource);
        this.type = new ParameterTypeModel(output.type, V1WorkflowOutputParameterModel, `${this.id}_field`,`${this.loc}.type`);
        this.type.setValidationCallback(err => this.updateValidity(err));
        this.type.hasDirectoryType = true;

        this._label = output.label;
        this.description = ensureArray(output.doc).join("\n\n");

        this.fileTypes = commaSeparatedToArray(output.format);
        spreadSelectProps(output, this.customProps, serializedKeys);
    }

    serialize(): WorkflowOutputParameter {
        const base: WorkflowOutputParameter = <WorkflowOutputParameter>{};
        base.id = this.id;

        if (this.source.length) base.outputSource = this.source.slice();
        if (this.type) base.type = this.type.serialize("v1.0");
        if (this._label) base.label = this._label;
        if (this.description) base.doc = this.description;

        return spreadAllProps(base, this.customProps);
    }
}