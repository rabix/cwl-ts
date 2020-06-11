import {V1CommandLineToolModel} from "../v1.0/V1CommandLineToolModel";

import {CommandLineTool} from "../../mappings/v1.0/CommandLineTool";

import {ProcessRequirement} from "../../mappings/v1.0/ProcessRequirement";

import {CommandLineBinding} from "../../mappings/v1.0/CommandLineBinding";
import {CommandOutputParameter} from "../../mappings/v1.0/CommandOutputParameter";

import {ProcessRequirementModel} from "../generic/ProcessRequirementModel";

import {V1_1CommandInputParameterModel} from "./V1_1CommandInputParameterModel";
import {V1_1CommandOutputParameterModel} from "./V1_1CommandOutputParameterModel";
import {V1_1ToolTimeLimitRequirementModel} from "./V1_1ToolTimeLimitRequirementModel";
import {V1_1WorkReuseRequirementModel} from "./V1_1WorkReuseRequirementModel";
import {V1_1CommandArgumentModel} from "./V1_1CommandArgumentModel";

import {incrementLastLoc, isType} from "../helpers";

export class V1_1CommandLineToolModel extends V1CommandLineToolModel {

    public cwlVersion = "v1.1";

    public inputs: Array<V1_1CommandInputParameterModel>;

    public outputs: Array<V1_1CommandOutputParameterModel>;

    public timeLimitRequirement: V1_1ToolTimeLimitRequirementModel;

    public workReuseRequirement: V1_1WorkReuseRequirementModel;

    constructor(json?: CommandLineTool, loc?: string) {
        super(json, loc);
    }

    public addOutput(output?: CommandOutputParameter): V1_1CommandOutputParameterModel {
        return super._addOutput(V1_1CommandOutputParameterModel, output);
    }

    public addInput(input?): V1_1CommandInputParameterModel {
        return super._addInput(V1_1CommandInputParameterModel, input);
    }

    public addArgument(arg?: CommandLineBinding | string): V1_1CommandArgumentModel {
        const loc = incrementLastLoc(this.arguments, `${this.loc}.arguments`);

        const a = new V1_1CommandArgumentModel(arg, loc, this.eventHub);
        this.arguments.push(a);

        a.setValidationCallback(err => this.updateValidity(err));
        this.eventHub.emit("argument.create", arg);
        return a;
    }

    protected createReq(req: ProcessRequirement, loc?: string, hint = false): ProcessRequirementModel {

        const property = hint ? "hints" : "requirements";
        loc = loc || `${this.loc}.${property}[${this[property].length}]`;

        if (req.class === 'ToolTimeLimit') {
            loc = this.timeLimitRequirement ? this.timeLimitRequirement.loc || loc : loc;
            this.timeLimitRequirement = new V1_1ToolTimeLimitRequirementModel(req, loc, this.eventHub);
            this.timeLimitRequirement.setValidationCallback(err => this.updateValidity(err));
            return;
        }

        if (req.class === 'WorkReuse') {
            loc = this.workReuseRequirement ? this.workReuseRequirement.loc || loc : loc;
            this.workReuseRequirement = new V1_1WorkReuseRequirementModel(req, loc, this.eventHub);
            this.workReuseRequirement.setValidationCallback(err => this.updateValidity(err));
            return;
        }

        super.createReq(req, loc, hint);

    }

    public deserialize(tool: CommandLineTool) {

        super.deserialize(tool);

        if (!this.timeLimitRequirement) {
            this.timeLimitRequirement =
                new V1_1ToolTimeLimitRequirementModel(
                    {class: 'ToolTimeLimit'},
                    `${this.loc}.requirements[${++this.requirementsCounter}]`,
                    this.eventHub);
        }

        if (!this.workReuseRequirement) {
            this.workReuseRequirement =
                new V1_1WorkReuseRequirementModel(
                    {class: 'WorkReuse'},
                    `${this.loc}.requirements[${++this.requirementsCounter}]`,
                    this.eventHub);
        }

    }


    serialize(): CommandLineTool {

        const base = super.serialize();
        base.cwlVersion = "v1.1";

        if (this.timeLimitRequirement.serialize()) {
            base.requirements = base.requirements || [];
            base.requirements.push(this.timeLimitRequirement.serialize());
        }

        if (this.workReuseRequirement.serialize()) {
            base.requirements = base.requirements || [];
            base.requirements.push(this.workReuseRequirement.serialize());
        }

        const hasDirectory = [...this.inputs, ...this.outputs]
            .find((port) => {
                return isType(port, ['Directory']);
            });

        if (hasDirectory) {
            base.requirements = base.requirements || [];
            if (!base.requirements.find(req => req.class === 'LoadListingRequirement')) {
                base.requirements.push({
                    "class": "LoadListingRequirement"
                });
            }
        }

        return base;

    }

}
