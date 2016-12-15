import {CommandOutputParameter} from "../../mappings/d2sb/CommandOutputParameter";
import {Serializable} from "../interfaces/Serializable";
import {ValidationBase} from "../helpers/validation";
import {OutputParameterTypeModel} from "./OutputParameterTypeModel";
import {CommandOutputBindingModel} from "./CommandOutputBindingModel";
import {Validation} from "../helpers/validation/Validation";

export class CommandOutputParameterModel extends ValidationBase implements Serializable<CommandOutputParameter> {

    /** Unique identifier of output */
    public id: string;
    /** Human readable short name */
    public label: string;
    /** Human readable description */
    public description: string;

    /** Flag if output is field of a parent record. Derived from type */
    public isField: boolean;

    /** Complex object that holds logic and information about output's type property */
    public type: OutputParameterTypeModel;

    /** Binding for connecting output files and CWL output description */
    public outputBinding: CommandOutputBindingModel;

    /** Description of file types expected for output to be */
    public fileTypes: string;

    customProps: any = {};

    constructor(output?: CommandOutputParameter, loc?: string) {
        super(loc);
        this.deserialize(output || <CommandOutputParameter>{});
    }

    updateOutputBinding(binding?: CommandOutputBindingModel) {
        this.outputBinding     = binding || new CommandOutputBindingModel();
        this.outputBinding.loc = `${this.loc}.outputBinding`;
        this.outputBinding.setValidationCallback((err) => this.updateValidity(err));
    }

    serialize(): CommandOutputParameter {
        let base: any = {};
        base          = Object.assign({}, base, this.customProps);

        base.type = this.type.serialize();

        if (this.label) base.label = this.label;
        if (this.description) base.description = this.description;
        if (this.fileTypes) base["sbg:fileTypes"] = this.fileTypes;

        if (this.outputBinding) {
            base.outputBinding = this.outputBinding.serialize();

            // only type File or File[] can have secondaryFiles, loadContents and fileTypes
            if (this.type.type !== "File" && this.type.items !== "File") {
                delete base.outputBinding.secondaryFiles;
                delete base.outputBinding.loadContents;
                delete base["sbg:fileTypes"];
            }

            if (!Object.keys(base.outputBinding).length) {
                delete base.outputBinding;
            }
        }


        base.id = this.id;

        return base;
    }

    deserialize(attr: CommandOutputParameter): void {
        const serializedAttr = [
            "id",
            "label",
            "description",
            "outputBinding",
            "type",
            "sbg:fileTypes"
        ];

        this.id          = attr.id;
        this.label       = attr.label;
        this.description = attr.description;
        this.fileTypes   = attr["sbg:fileTypes"];

        this.outputBinding = new CommandOutputBindingModel(attr.outputBinding);
        this.outputBinding.setValidationCallback(err => this.updateValidity(err));

        this.type = new OutputParameterTypeModel(attr.type, `${this.loc}.type`);
        this.type.setValidationCallback(err => this.updateValidity(err));

        Object.keys(attr).forEach(key => {
            if (serializedAttr.indexOf(key) === -1) {
                this.customProps[key] = attr[key];
            }
        });
    }

    validate(): Validation {
        //@fixme context should be passed with constructor if model can have expressions
        const val = {errors: [], warnings: []};

        //@fixme outputBinding validation isn't implemented
        // this.outputBinding.validate();
        this.type.validate();

        const errors   = this.validation.errors.concat(val.errors);
        const warnings = this.validation.warnings.concat(val.warnings);

        this.validation = {errors, warnings};

        return this.validation;
    }
}