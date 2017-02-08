import {OutputParameterTypeModel} from "./OutputParameterTypeModel";
import {ValidationBase} from "../helpers/validation/ValidationBase";

export class CommandOutputParameterModel extends ValidationBase {
    id: string;
    type: OutputParameterTypeModel;

    fileTypes?: string[];
}