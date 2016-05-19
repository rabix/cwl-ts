import {SystemResourceValue} from "../Symbols";
import {BaseRequirement} from "./BaseRequirement";
export interface ResourceRequirement extends BaseRequirement {
    coresMin?: SystemResourceValue;

    coresMax?: SystemResourceValue;

    ramMin?: SystemResourceValue;

    ramMax?: SystemResourceValue;

    tmpdirMin?: SystemResourceValue;

    tmpdirMax?: SystemResourceValue;

    outdirMin?: SystemResourceValue;

    outdirMax?: SystemResourceValue;
}