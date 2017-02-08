import {
    CommandInputParameter,
    CommandInputRecordField,
    CommandLineBinding,
    Expression
} from "../../mappings/v1.0";
import {CommandInputParameterModel} from "../generic/CommandInputParameterModel";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";


export class V1CommandInputParameterModel extends CommandInputParameterModel {
    id: string;

    type: ParameterTypeModel;
    inputBinding: CommandLineBinding;
    label: string;
    doc: string | string[];
    secondaryFiles: string | Expression | Array<string | Expression>;
    format: string | Array<string> | Expression;
    streamable: boolean;
    isField: boolean;

    constructor(attr: CommandInputParameter | CommandInputRecordField, loc?: string) {
        super(loc);

        if ((<CommandInputRecordField> attr).name) {
            this.id           = (<CommandInputRecordField> attr).name;
            this.isField = true;
        } else {
            this.id             = (<CommandInputParameter> attr).id;
        }

        this.type         = new ParameterTypeModel(attr.type, V1CommandInputParameterModel, `${this.loc}.type`);
        this.inputBinding   = attr.inputBinding;
        this.label          = (<CommandInputParameter> attr).label;
        this.doc            = (<CommandInputParameter> attr).doc;
        this.secondaryFiles = (<CommandInputParameter> attr).secondaryFiles;
        this.format         = (<CommandInputParameter> attr).format;
        this.streamable     = (<CommandInputParameter> attr).streamable;
    }
}
