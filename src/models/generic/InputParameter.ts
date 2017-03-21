import {ParameterTypeModel} from "./ParameterTypeModel";
export interface InputParameter {
    id: string;
    type: ParameterTypeModel;
    label?: string;
    description?: string;

    fileTypes?: string[];

    inputBinding?: any;
}