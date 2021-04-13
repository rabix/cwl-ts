import {EnvVarRequirementModel} from "../generic/EnvVarRequirementModel";
import {Serializable} from "../interfaces";
import {EnvironmentDef, EnvVarRequirement} from "../../mappings/v1.0";
import {ensureArray, spreadAllProps, spreadSelectProps} from "../helpers";
import {V1ExpressionModel} from "./V1ExpressionModel";

export class V1EnvVarRequirementModel extends EnvVarRequirementModel implements Serializable<EnvVarRequirement> {

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

            const envValueExpressionModel = new V1ExpressionModel(
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

        this.envDef = attr.envDef ? ensureArray(attr.envDef).map(transformToModel) : [];

        return spreadSelectProps(attr, this.customProps, ["class", "envDef"]);
    }
}
