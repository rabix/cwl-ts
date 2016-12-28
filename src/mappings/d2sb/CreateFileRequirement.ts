import {FileDef} from "./FileDef";
import {ProcessRequirement} from "./ProcessRequirement";
export type CreateFileRequirementClass = "CreateFileRequirement";

export interface CreateFileRequirement  extends ProcessRequirement {
    class: "CreateFileRequirement";
    fileDef: FileDef[];
}