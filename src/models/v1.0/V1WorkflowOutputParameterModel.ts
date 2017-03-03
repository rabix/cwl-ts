import {WorkflowOutputParameterModel} from "../generic/WorkflowOutputParameterModel";
import {WorkflowOutputParameter} from "../../mappings/v1.0/WorkflowOutputParameter";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {
    commaSeparatedToArray, ensureArray, spreadAllProps,
    spreadSelectProps
} from "../helpers/utils";

export class V1WorkflowOutputParameterModel extends WorkflowOutputParameterModel {

    constructor(output?, loc?: string) {
        super(loc);
        if (output) this.deserialize(output);
    }

    deserialize(output: WorkflowOutputParameter) {
        const serializedKeys = ["id", "source", "type", "label", "doc"];

        this.id = output.id;
        this.source = ensureArray(output.outputSource);
        this.type = new ParameterTypeModel(output.type, V1WorkflowOutputParameterModel, `${this.loc}.type`);
        this.label = output.label;
        this.description = ensureArray(output.doc).join("\n\n");

        this.fileTypes = commaSeparatedToArray(output["format"]);
        spreadSelectProps(output, this.customProps, serializedKeys);
    }

    serialize(): WorkflowOutputParameter {
        return spreadAllProps({
            id: this.id,
            outputSource: this.source,
            type: this.type.serialize ? this.type.serialize() : "null"
        }, this.customProps);
    }
}