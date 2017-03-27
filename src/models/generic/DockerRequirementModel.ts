import {ProcessRequirementModel} from "./ProcessRequirementModel";
import {Serializable} from "../interfaces/Serializable";
import {DockerRequirement} from "../../mappings/v1.0/DockerRequirement";
import {spreadAllProps, spreadSelectProps} from "../helpers/utils";

export class DockerRequirementModel extends ProcessRequirementModel implements DockerRequirement, Serializable<DockerRequirement> {
    public class = "DockerRequirement";
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
        super(loc);
        if (req) this.deserialize(req);
    }

    serialize(): DockerRequirement {
        let base = <DockerRequirement>{};

        this.serializedKeys.forEach(key => {
            if (this[key]) base[key] = this[key];
        });

        // don't serialize if the only property that is being serialized is the class
        const keys = Object.keys(base);
        const customPropsKeys = Object.keys(this.customProps);
        if (keys.length === 1 && keys[0] === "class" && customPropsKeys.length === 0) {
            return undefined;
        }

        return spreadAllProps(base, this.customProps);
    }

    deserialize(attr: DockerRequirement): void {
        this.serializedKeys.forEach(key => {
            this[key] = attr[key];
        });

        this.class = "DockerRequirement";

        spreadSelectProps(attr, this.customProps, this.serializedKeys);
    }
}