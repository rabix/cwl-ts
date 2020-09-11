import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces";
import {V1ExpressionModel} from "../v1.0";
import {Expression} from "../../mappings/v1.0";
import {SecondaryFileSchema} from "../../mappings/v1.1/SecondaryFileSchema";
import {EventHub} from "../helpers/EventHub";
import {ErrorCode} from "../helpers/validation";

export class V1_1SecondaryFileSchemaModel extends ValidationBase implements Serializable<SecondaryFileSchema> {

    pattern: V1ExpressionModel;
    required: boolean | V1ExpressionModel;

    customProps: any;

    constructor(attr: string | any, loc?: string, private eventHub?: EventHub) {
        super(loc);

        this.deserialize(attr);
    }

    setPattern(value: string) {

        if (!this.pattern) {
            this.pattern = new V1ExpressionModel(value, `${this.loc}.pattern`, this.eventHub);
            this.pattern.setValidationCallback(err => this.updateValidity(err));
        } else {
            this.pattern.setValue(value);
        }
    }

    setRequired(value: boolean | string) {

        if (typeof value === 'boolean') {

            if (this.required instanceof V1ExpressionModel) {
                this.required.clearIssue(ErrorCode.ALL);
            }

            this.required = !!value;
            return;
        }

        if (!this.required || !(this.required instanceof V1ExpressionModel)) {
            this.required = new V1ExpressionModel(value, `${this.loc}.required`, this.eventHub);
            this.required.setValidationCallback(err => this.updateValidity(err));
        } else {
            this.required.setValue(value);
        }

    }

    deserialize(attr: string | any): void {

        const isString = typeof attr === 'string';
        const pattern = isString ? (attr.endsWith('?') ? attr.slice(0, -1) : attr) : (attr.pattern || "");
        this.setPattern(pattern);
        let required = isString ? !attr.endsWith('?') : attr.required;
        this.setRequired(required);

    }

    serialize(): SecondaryFileSchema {
        const base = {} as SecondaryFileSchema;

        base.pattern = this.pattern.serialize();
        base.required = (this.required instanceof V1ExpressionModel)
            ? <Expression>this.required.serialize() : this.required;

        if (base.pattern === undefined) {
            return undefined;
        }

        return base;
    }

}
