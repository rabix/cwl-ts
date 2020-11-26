import {ProcessRequirementModel} from "./ProcessRequirementModel";
import {EnvVarRequirement as V1EnvVarRequirement} from "../../mappings/v1.0";
import {EnvVarRequirement as SBDraft2EnvVarRequirement} from "../../mappings/d2sb/EnvVarRequirement";
import {EventHub} from "../helpers/EventHub";
import {ExpressionModel} from "./ExpressionModel";

export type EnvVarRequirement = V1EnvVarRequirement | SBDraft2EnvVarRequirement;

export interface EnvironmentDefModel {
    envName: string;
    envValue: ExpressionModel;
}

export abstract class EnvVarRequirementModel extends ProcessRequirementModel {

    readonly class = "EnvVarRequirement";
    envDef: EnvironmentDefModel[];

    constructor(req?: EnvVarRequirement, loc?: string, protected eventHub?: EventHub) {
        super(loc);
        if (req) this.deserialize(req);
    }
}

