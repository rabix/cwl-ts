import {ParameterTypeModel} from "./ParameterTypeModel";
import {ExpressionModel} from "./ExpressionModel";

export interface OutputParameter {
    id: string;
    type: ParameterTypeModel;
    label?: string;
    description?: string;

    fileTypes?: string[];

    secondaryFiles?: ExpressionModel[];
}
