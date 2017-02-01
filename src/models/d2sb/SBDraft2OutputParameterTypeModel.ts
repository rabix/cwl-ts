import {CommandOutputParameterType} from "../../mappings/d2sb/CommandOutputParameter";
import {OutputParameterTypeModel} from "../generic/OutputParameterTypeModel";

export class SBDraft2OutputParameterTypeModel extends OutputParameterTypeModel {
    constructor(attr: CommandOutputParameterType, loc: string) {
        super(attr, loc);
    }

    addField(field: any) {

    }

    removeField(field: any) {

    }
}