import {InputParameterTypeModel} from "../generic/InputParameterTypeModel";
import {V1WorkflowInputParameterModel} from "./V1WorkflowInputParameterModel";
import {InputParameter} from "../../mappings/v1.0/InputParameter";
import {RecordField} from "../../mappings/v1.0/RecordField";
import {Validation} from "../helpers/validation/Validation";

export class V1InputParameterTypeModel extends InputParameterTypeModel {
    public addField(field: V1WorkflowInputParameterModel | InputParameter | RecordField): void {
        if (this.type !== "record" && this.items !== "record") {
            throw(`Fields can only be added to type or items record: type is ${this.type}, items is ${this.items}.`);
        } else {
            const duplicate = this.fields.filter(val => {
                return val.id === (<RecordField> field).name
                    || val.id === (<InputParameter> field).id;
            });
            if (duplicate.length > 0) {
                this.validation.errors.push({
                    loc: this.loc,
                    message: `Field with name "${duplicate[0].id}" already exists`
                });
            }

            if (field instanceof V1WorkflowInputParameterModel) {
                field.loc = `${this.loc}.fields[${this.fields.length}]`;
                field.setValidationCallback((err: Validation) => {this.updateValidity(err)});

                this.fields.push(field);
            } else {
                const f = new V1WorkflowInputParameterModel(field, `${this.loc}.fields[${this.fields.length}]`);
                f.setValidationCallback((err: Validation) => {this.updateValidity(err)});

                this.fields.push(f);
            }
        }
    }

    public removeField(field: V1WorkflowInputParameterModel | string) {
        let found;

        if (typeof field === "string") {
            found = this.fields.filter(val => val.id === field)[0];
        } else {
            found = field;
        }

        const index = this.fields.indexOf(found);
        if (index < 0) {
            throw(`Field ${field} does not exist on input`);
        }

        this.fields.splice(index, 1);
    }

}