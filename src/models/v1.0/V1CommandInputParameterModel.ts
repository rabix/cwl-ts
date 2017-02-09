import {
    CommandInputParameter,
    CommandInputRecordField,
    CommandLineBinding,
    Expression
} from "../../mappings/v1.0";
import {CommandInputParameterModel} from "../generic/CommandInputParameterModel";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {Serializable} from "../interfaces/Serializable";
import {ensureArray} from "../helpers/utils";

export class V1CommandInputParameterModel extends CommandInputParameterModel implements Serializable<CommandInputParameter | CommandInputRecordField> {
    public id: string;
    public type: ParameterTypeModel;
    public inputBinding: CommandLineBinding;
    public label: string;
    public description: string;
    public secondaryFiles: string | Expression | Array<string | Expression>;
    public format: string | Array<string> | Expression;
    public streamable: boolean;
    public isField: boolean;

    constructor(attr: CommandInputParameter | CommandInputRecordField, loc?: string) {
        super(loc);
        if (attr) this.deserialize(attr);
    }

    public customProps: any = {};

    public serialize(): CommandInputParameter | CommandInputRecordField {
        let base: any = {... this.customProps};

        base.type = this.type.serialize();
        if (this.isField) {
            base.name = this.id;
        } else {
            base.id = this.id;
        }

        if (this.inputBinding) base.inputBinding = this.inputBinding; // not deserialized yet

        if (this.label) base.label = this.label;
        if (this.description.length) base.description = this.description;
        if (this.format) base.format = this.format;
        if (this.streamable !== undefined) base.streamable = this.streamable;
        if (this.secondaryFiles) base.secondaryFiles = this.secondaryFiles;

        return base;

    }

    deserialize(attr: CommandInputParameter|CommandInputRecordField): void {
        const serializedKeys = ["type", "doc", "inputBinding", "label", "secondaryFiles", "format", "streamable"];

        if ((<CommandInputRecordField> attr).name) {
            this.id      = (<CommandInputRecordField> attr).name;
            this.isField = true;
            serializedKeys.push("name");
        } else {
            this.id = (<CommandInputParameter> attr).id;
            serializedKeys.push("id");
        }

        this.type           = new ParameterTypeModel(attr.type, V1CommandInputParameterModel, `${this.loc}.type`);
        this.inputBinding   = attr.inputBinding;
        this.label          = attr.label;
        this.description    = ensureArray(attr.doc).join('\n');
        this.secondaryFiles = (<CommandInputParameter> attr).secondaryFiles;
        this.format         = (<CommandInputParameter> attr).format;
        this.streamable     = (<CommandInputParameter> attr).streamable;

        Object.keys(attr).forEach(key => {
            if (serializedKeys.indexOf(key) === -1) {
                this.customProps[key] = attr[key];
            }
        });
    }
}
