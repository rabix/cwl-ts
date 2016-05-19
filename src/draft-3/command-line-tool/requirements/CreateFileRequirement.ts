import {FileDef} from "../FileDef";
import {BaseRequirement} from "./BaseRequirement";
export interface CreateFileRequirement extends BaseRequirement {
    fileDef: FileDef[];
}