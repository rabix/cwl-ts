import {OutputParameterTypeModel} from "./OutputParameterTypeModel";

export interface OutputParameter {
    id: string;
    type: OutputParameterTypeModel;

    fileTypes?: string[];
}