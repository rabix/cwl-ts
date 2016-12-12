import {Serializable} from "../interfaces/Serializable";
import {CommandOutputBinding} from "../../mappings/d2sb/CommandOutputBinding";
import {ExpressionModel} from "./ExpressionModel";
import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Expression} from "../../mappings/d2sb/Expression";

export class CommandOutputBindingModel extends ValidationBase implements Serializable<CommandOutputBinding> {
    public loadContents: boolean;
    public metadata: {[key: string]: ExpressionModel} = {};
    public inheritMetadataFrom: string;

    private _glob: ExpressionModel;

    get glob(): ExpressionModel {
        return this._glob;
    }

    set glob(value: ExpressionModel) {
        this._glob     = value;
        this._glob.loc = `${this.loc}.glob`;
        this._glob.setValidationCallback(err => this.updateValidity(err));
    }

    private _secondaryFiles: ExpressionModel[] = [];

    get secondaryFiles(): ExpressionModel[] {
        return this._secondaryFiles;
    }

    private _outputEval: ExpressionModel;

    get outputEval(): ExpressionModel {
        return this._outputEval;
    }

    set outputEval(value: ExpressionModel) {
        this._outputEval = value;
        this._outputEval.loc = `${this.loc}.outputEval`;
        this._outputEval.setValidationCallback(err => this.updateValidity(err));

        if (!this._outputEval.isExpression) {
            this._outputEval.validation = {
                errors: [{
                    loc: `${this.loc}.outputEval`,
                    message: `outputEval must be an expression, instead got ${value.type}`}],
                warnings: []};
        }
    }

    public updateOutputEval(expr: ExpressionModel) {
        this.outputEval = expr;
    }


    constructor(binding?: CommandOutputBinding, loc?: string) {
        super(loc);
        this.deserialize(binding || {});
    }

    public updateSecondaryFile(file: ExpressionModel, index: number) {
        this._secondaryFiles[index] = file;

        file.loc = `${this.loc}.secondaryFiles[${index}]`;
        file.setValidationCallback((err) => this.updateValidity(err));
    }

    public removeSecondaryFile(index: number) {
        this._secondaryFiles.splice(index, 1);

        if (index !== this._secondaryFiles.length) {
            this._secondaryFiles.forEach((file, index) => {
                file.loc = `${this.loc}.secondaryFiles[${index}]`;
            });
        }
    }

    public addSecondaryFile(file: ExpressionModel) {
        this.updateSecondaryFile(file, this._secondaryFiles.length);
    }

    customProps: any = {};

    serialize(): CommandOutputBinding {
        let base: CommandOutputBinding = {};
        if (this._glob && this._glob.serialize()) base.glob = <string | Expression> this._glob.serialize();
        if (this._secondaryFiles.length) {
            base.secondaryFiles = <Array<string | Expression>> this._secondaryFiles
                .map(file => file.serialize());
        }

        if(Object.keys(this.metadata).length) {
            base["sbg:metadata"] = {};
            Object.keys(this.metadata).forEach(key => {
                base["sbg:metadata"][key] = <string | Expression> this.metadata[key].serialize();
            });
        }

        if (this.inheritMetadataFrom) base["sbg:inheritMetadataFrom"] = this.inheritMetadataFrom;

        if (this.loadContents) base.loadContents = true;
        if (this._outputEval.serialize()) base.outputEval = <Expression> this._outputEval.serialize();

        return Object.assign({}, this.customProps, base);
    }

    deserialize(binding: CommandOutputBinding): void {
        const serializedKeys = [
            "glob",
            "secondaryFiles",
            "loadContents",
            "sbg:metadata",
            "sbg:inheritMetadataFrom"
        ];

        if (binding && binding.constructor === Object) {
            if (!Array.isArray(binding.glob)) {
                this._glob = new ExpressionModel(this.loc + '.glob', binding.glob);
                this._glob.setValidationCallback((err) => this.updateValidity(err));
            } else {
                console.warn(`Not supporting glob which is string[] at ${this.loc}. Glob cannot be edited via model`);
                serializedKeys.splice(1, 0);
            }

            this.loadContents        = binding.loadContents === true;
            this.inheritMetadataFrom = binding["sbg:inheritMetadataFrom"];

            this._outputEval = new ExpressionModel(`${this.loc}.outputEval`, binding.outputEval);

            if (binding.secondaryFiles) {
                if (Array.isArray(binding.secondaryFiles)) {
                    //noinspection TypeScriptUnresolvedFunction
                    this._secondaryFiles = binding.secondaryFiles
                        .map((file, index) => {
                            const f = new ExpressionModel(`${this.loc}.secondaryFiles[${index}]`,
                                file);
                            f.setValidationCallback((err) => this.updateValidity(err));
                            return f;
                        });
                } else {
                    const f = new ExpressionModel(`${this.loc}.secondaryFiles[0]`,
                        <string | Expression> binding.secondaryFiles);
                    f.setValidationCallback((err) => this.updateValidity(err));

                    this._secondaryFiles = [f];
                }
            }

            if (binding["sbg:metadata"] && binding["sbg:metadata"].constructor === Object) {
                Object.keys(binding["sbg:metadata"]).forEach(key => {
                    this.metadata[key] = new ExpressionModel(`${this.loc}["sbg:metadata"].${key}`,
                        binding["sbg:metadata"][key]);
                    this.metadata[key].setValidationCallback(err => this.updateValidity(err));
                });
            }

            Object.keys(binding).forEach(key => {
                if (serializedKeys.indexOf(key) === -1) {
                    this.customProps[key] = binding[key];
                }
            });
        }
    }
}