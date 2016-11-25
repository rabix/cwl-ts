import {ProcessRequirementModel} from "./ProcessRequirementModel";
import {CreateFileRequirementClass} from "../../mappings/d2sb/CreateFileRequirement";
import {CreateFileRequirement} from "../../mappings/d2sb/CreateFileRequirement";
import {FileDef} from "../../mappings/d2sb/FileDef";
import {Serializable} from "../interfaces/Serializable";

export class CreateFileRequirementModel extends ProcessRequirementModel implements CreateFileRequirement, Serializable<CreateFileRequirement> {
    public class: CreateFileRequirementClass = "CreateFileRequirement";
    public fileDef: FileDef[];

    public customProps: any = {};

    constructor(req: CreateFileRequirement, loc?: string) {
        super(req, loc);
        this.deserialize(req);
    }

    deserialize(req: CreateFileRequirement) {
        this.fileDef = req.fileDef;
        Object.keys(req).forEach(key => {
            if (key !== "fileDef" && key !== "class") this.customProps[key] = req[key];
        })
    }

    serialize(): CreateFileRequirement {
        let base = <CreateFileRequirement> {};

        return Object.assign({}, base, this.customProps);
    }

}