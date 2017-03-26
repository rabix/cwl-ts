import {ProcessRequirement} from "../../mappings/d2sb/ProcessRequirement";
import {ProcessRequirementModel} from "./ProcessRequirementModel";
import {Serializable} from "../interfaces/Serializable";
import {SBDraft2ExpressionModel} from "../d2sb/SBDraft2ExpressionModel";
import {spreadSelectProps} from "../helpers/utils";
import {ExpressionModel} from "./ExpressionModel";

export class RequirementBaseModel extends ProcessRequirementModel implements Serializable<ProcessRequirement> {
    'class': string;
    value?: any | ExpressionModel;

    constructor(req?: ProcessRequirement | any,
                private exprConstructor?: new (...args: any[]) => ExpressionModel,
                loc?: string) {
        super(loc);
        this.deserialize(req);
    }

    customProps: any = {};

    public updateValue(value: any | ExpressionModel) {
        this.value = value;

        if (value instanceof ExpressionModel) {
            (<ExpressionModel> this.value).setValidationCallback(err => this.updateValidity(err));
            (<ExpressionModel> this.value).loc = `${this.loc}.value`;
        }
    }

    serialize(): ProcessRequirement {
        // value stored in customProps was whole value of hint
        if (this.customProps.constructor.name !== "Object") {
            return this.customProps;
        }

        let base = <ProcessRequirement>{};
        if (this.class) base.class = this.class;
        if (this.value) {
            base["value"] = this.value instanceof ExpressionModel ?
                (<ExpressionModel> this.value).serialize() :
                this.value;
        }

        return Object.assign({}, base, this.customProps);
    }

    deserialize(attr: ProcessRequirement): void {
        // hint is not an object type, therefore it cannot be deserialized
        if (attr.constructor.name !== "Object") {
            this.customProps = attr;
            return;
        }

        this.class = attr.class;

        if (attr["value"] !== undefined) {
            this.value = attr["value"];
            if (typeof this.value === "string" || this.value["script"]) {
                this.value = new this.exprConstructor(attr["value"], `${this.loc}.value`);
                (<ExpressionModel> this.value).setValidationCallback(err => this.updateValidity(err));
            }
        }

        spreadSelectProps(attr, this.customProps, ["class", "value"]);
    }
}