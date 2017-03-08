import {ValidationBase} from "../helpers/validation/ValidationBase";
import {InputParameterTypeModel} from "./InputParameterTypeModel";

export abstract class InputParameterModel extends ValidationBase {
    id: string;
    type: InputParameterTypeModel;
    label?: string;
    description?: string;

    fileTypes?: string[];

    inputBinding?: any;
}