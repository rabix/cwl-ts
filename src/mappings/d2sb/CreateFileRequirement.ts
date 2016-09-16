import {FileDef} from "./FileDef";
export type CreateFileRequirementClass = "CreateFileRequirement";

export interface CreateFileRequirement {
    class: CreateFileRequirementClass;
    fileDef: FileDef[];
}