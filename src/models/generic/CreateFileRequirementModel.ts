import {ProcessRequirementModel} from "./ProcessRequirementModel";
import {FileDefModel} from "../d2sb/FileDefModel";

export abstract class CreateFileRequirementModel extends ProcessRequirementModel {
    class: string;
    fileDef: FileDefModel[];
}