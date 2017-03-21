import {ValidationBase} from "../helpers/validation/ValidationBase";
import {ParameterTypeModel} from "./ParameterTypeModel";

export abstract class InputParameterModel extends ValidationBase {
    id: string;
    type: ParameterTypeModel;
    label?: string;
    description?: string;

    fileTypes?: string[];

    inputBinding?: any;
}