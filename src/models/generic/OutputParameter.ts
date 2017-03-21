import {ParameterTypeModel} from "./ParameterTypeModel";

export interface OutputParameter {
    id: string;
    type: ParameterTypeModel;
    label?: string;
    description?: string;

    fileTypes?: string[];
}