import {CommandOutputBinding} from "../../mappings/d2sb/CommandOutputBinding";
import {Expression} from "../../mappings/d2sb/Expression";
import {CommandOutputBindingModel} from "../generic/CommandOutputBindingModel";
import {Serializable} from "../interfaces/Serializable";
import {SBDraft2ExpressionModel} from "./SBDraft2ExpressionModel";

export class SBDraft2CommandOutputBindingModel extends CommandOutputBindingModel implements Serializable<CommandOutputBinding> {
    public loadContents: boolean;
    public metadata: { [key: string]: SBDraft2ExpressionModel } = {};
    public inheritMetadataFrom: string;

    public hasSecondaryFiles  = true;
    public hasMetadata        = true;
    public hasInheritMetadata = true;

    private _glob: SBDraft2ExpressionModel;

    get glob(): SBDraft2ExpressionModel {
        return this._glob;
    }

    set glob(value: SBDraft2ExpressionModel) {
        this._glob     = value;
        this._glob.loc = `${this.loc}.glob`;
        this._glob.setValidationCallback(err => this.updateValidity(err));
    }

    private _secondaryFiles: SBDraft2ExpressionModel[] = [];

    get secondaryFiles(): SBDraft2ExpressionModel[] {
        return this._secondaryFiles;
    }

    set secondaryFiles(files: SBDraft2ExpressionModel[]) {
        this._secondaryFiles = files;

        files.forEach((file, index) => {
            file.loc = `${this.loc}.secondaryFiles[${index}]`;
            file.setValidationCallback((err) => this.updateValidity(err))
        });
    }

    private _outputEval: SBDraft2ExpressionModel;

    get outputEval(): SBDraft2ExpressionModel {
        return this._outputEval;
    }

    set outputEval(value: SBDraft2ExpressionModel) {
        this._outputEval     = value;
        this._outputEval.loc = `${this.loc}.outputEval`;
        this._outputEval.setValidationCallback(err => this.updateValidity(err));

        if (!this._outputEval.isExpression) {
            this._outputEval.updateValidity({
                [`${this.loc}.outputEval`]: {
                    type: "error",
                    message: `outputEval must be an expression, instead got ${value.type}`
                }
            })
            // this._outputEval.validation = {
            //     errors: [{
            //         loc: `${this.loc}.outputEval`,
            //         message: `outputEval must be an expression, instead got ${value.type}`
            //     }],
            //     warnings: []
            // };
        }
    }

    public updateOutputEval(expr: SBDraft2ExpressionModel) {
        this.outputEval = expr;
    }

    constructor(binding?: CommandOutputBinding, loc?: string) {
        super(loc);
        this.deserialize(binding || {});
    }

    public updateSecondaryFile(file: SBDraft2ExpressionModel, index: number) {
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

    public addSecondaryFile(file: SBDraft2ExpressionModel) {
        this.updateSecondaryFile(file, this._secondaryFiles.length);
    }

    validate(context): Promise<any> {
        this.cleanValidity();
        const promises = [];

        if (!this._glob || (this._glob && this._glob.serialize() === undefined)) {
            this.updateValidity({
                [`${this.loc}.glob`]: {
                    message: "Glob should be specified",
                    type: "warning"
                }
            });
        } else {
            promises.push(this._glob.validate(context));
        }

        if (this._outputEval) {
            promises.push(this._outputEval.validate(context));
        }
        return Promise.all(promises).then(() => this.issues);

    }

    customProps: any = {};

    serialize(): CommandOutputBinding {
        let base: CommandOutputBinding = {};
        if (this._glob && this._glob.serialize()) {
            base.glob = <string | Expression> this._glob.serialize();
        }
        if (this._secondaryFiles.length) {
            base.secondaryFiles = <Array<string | Expression>> this._secondaryFiles
                .map(file => file.serialize())
                .filter(file => !!file);
        }

        if (Object.keys(this.metadata).length) {
            base["sbg:metadata"] = {};
            Object.keys(this.metadata).forEach(key => {
                base["sbg:metadata"][key] = <string | Expression> this.metadata[key].serialize();
            });
        }

        if (this.inheritMetadataFrom) {
            base["sbg:inheritMetadataFrom"] = this.inheritMetadataFrom.substr(0) === "#" ? this.inheritMetadataFrom : "#" + this.inheritMetadataFrom;
        }

        if (this.loadContents) base.loadContents = true;
        if (this._outputEval.serialize()) {
            base.outputEval = <Expression> this._outputEval.serialize();
        }

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
                this._glob = new SBDraft2ExpressionModel(binding.glob, this.loc + '.glob');
                this._glob.setValidationCallback((err) => this.updateValidity(err));
            } else {
                console.warn(`Not supporting glob which is string[] at ${this.loc}. Glob cannot be edited via model`);
                serializedKeys.splice(1, 0);
            }

            this.loadContents = binding.loadContents === true;

            this.inheritMetadataFrom = null;
            if (binding["sbg:inheritMetadataFrom"]) {
                this.inheritMetadataFrom = binding["sbg:inheritMetadataFrom"].charAt(0) === "#" ?
                    binding["sbg:inheritMetadataFrom"].substr(1) :
                    binding["sbg:inheritMetadataFrom"];
            }

            this._outputEval = new SBDraft2ExpressionModel(binding.outputEval, `${this.loc}.outputEval`);

            if (binding.secondaryFiles) {
                if (Array.isArray(binding.secondaryFiles)) {
                    //noinspection TypeScriptUnresolvedFunction
                    this._secondaryFiles = binding.secondaryFiles
                        .map((file, index) => {
                            const f = new SBDraft2ExpressionModel(file, `${this.loc}.secondaryFiles[${index}]`);
                            f.setValidationCallback((err) => this.updateValidity(err));
                            return f;
                        });
                } else {
                    const f = new SBDraft2ExpressionModel(
                        <string | Expression> binding.secondaryFiles,
                        `${this.loc}.secondaryFiles[0]`);
                    f.setValidationCallback((err) => this.updateValidity(err));

                    this._secondaryFiles = [f];
                }
            }

            if (binding["sbg:metadata"] && binding["sbg:metadata"].constructor === Object) {
                Object.keys(binding["sbg:metadata"]).forEach(key => {
                    this.metadata[key] = new SBDraft2ExpressionModel(binding["sbg:metadata"][key], `${this.loc}["sbg:metadata"].${key}`);
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