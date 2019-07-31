import {ValidationBase} from "../helpers/validation/ValidationBase";
import {ParameterTypeModel} from "./ParameterTypeModel";
import {ExpressionModel} from "./ExpressionModel";

export abstract class InputParameterModel extends ValidationBase {
    id: string;
    type: ParameterTypeModel;
    label?: string;
    description?: string;
    secondaryFiles?: ExpressionModel[];

    fileTypes?: string[];
    customProps: any;

    inputBinding?: any;
}
