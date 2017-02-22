import {InputParameterTypeModel} from "./InputParameterTypeModel";

export interface InputParameter {
    id: string;
    type: InputParameterTypeModel;
    label?: string;
    description?: string;

    fileTypes?: string[];
}