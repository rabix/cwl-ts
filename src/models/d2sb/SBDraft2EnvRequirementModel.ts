import {EnvVarRequirementModel} from "../generic/EnvVarRequirementModel";
import {Serializable} from "../interfaces";
import {EnvVarRequirement} from "../../mappings/d2sb/EnvVarRequirement";
import {SBDraft2ExpressionModel} from "./SBDraft2ExpressionModel";
import {ensureArray, spreadAllProps, spreadSelectProps} from "../helpers";
import {EnvironmentDef} from "../../mappings/d2sb/EnvironmentDef";

export class SBDraft2EnvRequirementModel extends EnvVarRequirementModel implements Serializable<EnvVarRequirement> {

    serialize(): EnvVarRequirement {
        let base = <EnvVarRequirement> {};

        base.class = this.class;

        base.envDef = this.envDef
            .map(def => {
                return {
                    envName: def.envName,
                    envValue: def.envValue.serialize(),
                }
            })
            .filter(def => !!def.envName);

        if (base.envDef.length == 0) {
            return;
        }

        return spreadAllProps(base, this.customProps);
    }

    deserialize(attr: EnvVarRequirement): void {

        const transformToModel = (envDef: EnvironmentDef, idx: number) => {
            const envValue = envDef.envValue || '';

            const envValueExpressionModel = new SBDraft2ExpressionModel(
                envValue,
                `${this.loc}.envDef[${idx}].envValue`,
                this.eventHub
            );

            envValueExpressionModel.setValidationCallback(err => this.updateValidity(err));

            return {
                envName: envDef.envName,
                envValue: envValueExpressionModel
            }
        };

        this.envDef = attr.envDef
            ? ensureArray(attr.envDef, 'envName', 'envValue').map(transformToModel)
            : [];

        return spreadSelectProps(attr, this.customProps, ["class", "envDef"]);
    }
}
