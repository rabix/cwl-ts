import {InputParameterTypeModel} from "./InputParameterTypeModel";
import {InputParameter} from "./InputParameter";
import {ValidationBase} from "../helpers/validation/ValidationBase";

export class CommandInputParameterModel extends ValidationBase implements InputParameter {

    id: string;
    type: InputParameterTypeModel;
}