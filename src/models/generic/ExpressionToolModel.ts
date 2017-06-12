import {Serializable} from "../interfaces/Serializable";
import {CWLVersion} from "../../mappings/v1.0/CWLVersion";
import {InputParameterModel} from "./InputParameterModel";
import {ValidationBase} from "../helpers/validation/ValidationBase";
import {V1CommandInputParameterModel} from "../v1.0/V1CommandInputParameterModel";
import {V1CommandOutputParameterModel} from "../v1.0/V1CommandOutputParameterModel";
import {ensureArray, spreadAllProps, spreadSelectProps} from "../helpers/utils";

export class ExpressionToolModel extends ValidationBase implements Serializable<any> {
    id: string;
    "class" = "ExperssionTool";
    customProps: any = {};
    cwlVersion: CWLVersion;

    label?: string;
    description?: string;

    constructor(tool?, loc?: string) {
        super(loc);

        if (tool) this.deserialize(tool);
    }

    serialize(): any {
        return spreadAllProps({}, this.customProps);
    }

    deserialize(attr: any): void {
        this.inputs = ensureArray(attr.inputs, "id", "type").map(i => new V1CommandInputParameterModel(i));
        this.outputs = ensureArray(attr.outputs, "id", "type").map(o => new V1CommandOutputParameterModel(o));
        this.id = attr.id;
        this.label = attr.label;
        this.description = attr.doc || attr.description;

        spreadSelectProps(attr, this.customProps, []);
    }

    inputs: InputParameterModel[];
    outputs: any[];
}