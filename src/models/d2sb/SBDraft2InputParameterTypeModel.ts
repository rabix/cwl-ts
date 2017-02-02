import {CommandInputParameterModel} from "./CommandInputParameterModel";
import {Validation} from "../helpers/validation/Validation";
import {CommandInputParameter} from "../../mappings/d2sb/CommandInputParameter";
import {CommandInputRecordField} from "../../mappings/d2sb/CommandInputRecordField";
import {InputParameterTypeModel} from "../generic/InputParameterTypeModel";

export class SBDraft2InputParameterTypeModel extends InputParameterTypeModel {
    public fields: Array<any>;

    constructor(attr: any, loc: string) {
        super(attr, loc);

        if (this.fields) {
            this.fields = this.fields.map((field, index) => {
                const f = new CommandInputParameterModel(`${this.loc}.fields[${index}]`, field);
                f.setValidationCallback((err: Validation) => {this.updateValidity(err)});
                return f;
            });
        }
    }

    public addField(field: CommandInputParameterModel | CommandInputParameter | CommandInputRecordField): void {
        if (this.type !== "record" && this.items !== "record") {
            throw(`Fields can only be added to type or items record: type is ${this.type}, items is ${this.items}.`);
        } else {
            const duplicate = this.fields.filter(val => {
                return val.id === (<CommandInputRecordField> field).name
                    || val.id === (<CommandInputParameter> field).id;
            });
            if (duplicate.length > 0) {
                this.validation.errors.push({
                    loc: this.loc,
                    message: `Field with name "${duplicate[0].id}" already exists`
                });
            }

            if (field instanceof CommandInputParameterModel) {
                field.loc = `${this.loc}.fields[${this.fields.length}]`;
                field.setValidationCallback((err: Validation) => {this.updateValidity(err)});

                this.fields.push(field);
            } else {
                const f = new CommandInputParameterModel(`${this.loc}.fields[${this.fields.length}]`, <CommandInputRecordField>field);
                f.setValidationCallback((err: Validation) => {this.updateValidity(err)});

                this.fields.push(f);
            }
        }
    }

    public removeField(field: CommandInputParameterModel | string) {
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

    serialize(): any {
        const base = super.serialize();

        if (this.fields) {
            if (Array.isArray(base)) {
                const t = base[0].fields ? base[0] : (base[1].fields ? base[1] : null);
                if (t) t.fields = this.fields.map(field => field.serialize());
            } else if (base.fields) {
                base.fields = this.fields.map(field => field.serialize());
            }
        }

        return base;
    }
}