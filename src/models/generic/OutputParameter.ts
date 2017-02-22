import {OutputParameterTypeModel} from "./OutputParameterTypeModel";

export interface OutputParameter {
    id: string;
    type: OutputParameterTypeModel;
    label?: string;
    description?: string;

    fileTypes?: string[];
}