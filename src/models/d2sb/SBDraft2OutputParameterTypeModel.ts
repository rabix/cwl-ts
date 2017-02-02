import {
    CommandOutputParameter,
    CommandOutputParameterType
} from "../../mappings/d2sb/CommandOutputParameter";
import {OutputParameterTypeModel} from "../generic/OutputParameterTypeModel";
import {CommandOutputParameterModel} from "./CommandOutputParameterModel";
import {Validation} from "../helpers/validation/Validation";
import {CommandOutputRecordField} from "../../mappings/d2sb/CommandOutputRecordField";

export class SBDraft2OutputParameterTypeModel extends OutputParameterTypeModel {
    constructor(attr: CommandOutputParameterType, loc: string) {
        super(attr, loc);
    }

    public addField(field: CommandOutputParameterModel | CommandOutputParameter | CommandOutputRecordField): void {
        if (this.type !== "record" && this.items !== "record") {
            throw(`Fields can only be added to type or items record: type is ${this.type}, items is ${this.items}.`);
        } else {
            const duplicate = this.fields.filter(val => {
                return val.id === (<CommandOutputRecordField> field).name
                    || val.id === (<CommandOutputParameter> field).id;
            });
            if (duplicate.length > 0) {
                this.validation.errors.push({
                    loc: this.loc,
                    message: `Field with name "${duplicate[0].id}" already exists`
                });
            }

            if (field instanceof CommandOutputParameterModel) {
                field.loc = `${this.loc}.fields[${this.fields.length}]`;
                field.setValidationCallback((err: Validation) => {this.updateValidity(err)});

                this.fields.push(field);
            } else {
                const f = new CommandOutputParameterModel(field, `${this.loc}.fields[${this.fields.length}]`);
                f.setValidationCallback((err: Validation) => {this.updateValidity(err)});

                this.fields.push(f);
            }
        }
    }

    public removeField(field: CommandOutputParameterModel | string) {
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