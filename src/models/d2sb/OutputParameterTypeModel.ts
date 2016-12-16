import {ParameterTypeModel} from "./ParameterTypeModel";
import {CommandOutputParameterType} from "../../mappings/d2sb/CommandOutputParameter";

export class OutputParameterTypeModel extends ParameterTypeModel {
    constructor(attr: CommandOutputParameterType, loc: string) {
        super(attr, loc);
    }
}