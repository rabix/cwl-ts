import {ProcessRequirementModel} from "./ProcessRequirementModel";
import { DockerRequirementClass} from "../../mappings/d2sb/DockerRequirement";
import {Serializable} from "../interfaces/Serializable";
import {DockerRequirement} from "../../mappings/d2sb/DockerRequirement";
import {spreadSelectProps} from "../helpers/utils";

export class DockerRequirementModel extends ProcessRequirementModel implements DockerRequirement, Serializable<DockerRequirement> {
    public class: DockerRequirementClass = "DockerRequirement";
    public dockerPull: string;
    public dockerLoad: string;
    public dockerFile: string;
    public dockerImageId: string;
    public dockerOutputDirectory: string;

    public customProps: any = {};

    private serializedKeys = [
        "class",
        "dockerFile",
        "dockerImageId",
        "dockerLoad",
        "dockerOutputDirectory",
        "dockerPull"
    ];

    constructor(req?: DockerRequirement, loc?: string) {
        super(req, loc);
        if (req) this.deserialize(req);
    }

    serialize(): DockerRequirement {
        let base = <DockerRequirement>{};

        this.serializedKeys.forEach(key => {
            if (this[key]) base[key] = this[key];
        });

        return Object.assign({}, base, this.customProps);
    }

    deserialize(attr: DockerRequirement): void {
        this.serializedKeys.forEach(key => {
            this[key] = attr[key];
        });


        spreadSelectProps(attr, this.customProps, this.serializedKeys);
    }
}