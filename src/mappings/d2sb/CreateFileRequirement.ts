import {FileDef} from "./FileDef";
type CreateFileRequirementClass = "CreateFileRequirement";

export interface CreateFileRequirement {
    class: CreateFileRequirementClass;
    fileDef: FileDef[];
}