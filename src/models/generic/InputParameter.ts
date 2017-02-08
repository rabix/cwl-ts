import {InputParameterTypeModel} from "./InputParameterTypeModel";

export interface InputParameter {
    id: string;
    type: InputParameterTypeModel;

    fileTypes?: string[];
}