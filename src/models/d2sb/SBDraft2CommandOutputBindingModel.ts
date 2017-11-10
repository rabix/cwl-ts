import {CommandOutputBinding} from "../../mappings/d2sb/CommandOutputBinding";
import {Expression} from "../../mappings/d2sb/Expression";
import {CommandOutputBindingModel} from "../generic/CommandOutputBindingModel";
import {Serializable} from "../interfaces/Serializable";
import {SBDraft2ExpressionModel} from "./SBDraft2ExpressionModel";
import {EventHub} from "../helpers/EventHub";
import {ErrorCode} from "../helpers/validation/ErrorCode";

export class SBDraft2CommandOutputBindingModel extends CommandOutputBindingModel implements Serializable<CommandOutputBinding> {
    public loadContents: boolean;
    public metadata: { [key: string]: SBDraft2ExpressionModel } = {};
    public inheritMetadataFrom: string;

    public hasSecondaryFiles  = true;
    public hasMetadata        = true;
    public hasInheritMetadata = true;

    protected _glob: SBDraft2ExpressionModel;

    get glob(): SBDraft2ExpressionModel {
        return this._glob;
    }

    set glob(value: SBDraft2ExpressionModel) {
        this.setGlob(value, SBDraft2ExpressionModel);
    }

    protected _outputEval: SBDraft2ExpressionModel;

    get outputEval(): SBDraft2ExpressionModel {
        return this._outputEval;
    }

    set outputEval(value: SBDraft2ExpressionModel) {
        this.setOutputEval(value, SBDraft2ExpressionModel);
        this.validateOutputEval();
    }

    private validateOutputEval() {
        if (this._outputEval.type !== "expression" && this._outputEval.serialize() !== undefined) {
            this._outputEval.setIssue({
                [`${this.loc}.outputEval`]: {
                    type: "error",
                    message: `outputEval must be an expression`,
                    code: ErrorCode.OUTPUT_EVAL_EXPR
                }
            })
        } else {
            this._outputEval.clearIssue(ErrorCode.OUTPUT_EVAL_EXPR);
        }
    }

    setInheritMetadataFrom(inputId: string) {
        this.inheritMetadataFrom = inputId;
    }

    constructor(binding?: CommandOutputBinding, loc?: string, eventHub?: EventHub) {
        super(loc, eventHub);
        this.deserialize(binding || {});
    }

    customProps: any = {};

    serialize(): CommandOutputBinding {
        let base: CommandOutputBinding = {};
        if (this._glob && this._glob.serialize()) {
            base.glob = <string | Expression> this._glob.serialize();
        }

        if (Object.keys(this.metadata).length) {
            base["sbg:metadata"] = {};
            Object.keys(this.metadata).filter(key => key).forEach(key => {
                const serialized = this.metadata[key].serialize();
                if (serialized !== undefined) {
                    base["sbg:metadata"][key] = <string | Expression> serialized;
                }
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
            "outputEval",
            "loadContents",
            "sbg:metadata",
            "sbg:inheritMetadataFrom"
        ];

        if (binding && binding.constructor === Object) {
            if (!Array.isArray(binding.glob)) {
                this._glob = new SBDraft2ExpressionModel(binding.glob, this.loc + '.glob', this.eventHub);
                this._glob.setValidationCallback((err) => this.updateValidity(err));
                this.validateGlob();

            } else {
                console.warn(`Not supporting glob which is string[] at ${this.loc}. Glob cannot be edited via model`);
                serializedKeys.splice(0, 1);
            }

            this.loadContents = binding.loadContents === true;

            this.inheritMetadataFrom = null;
            if (binding["sbg:inheritMetadataFrom"]) {
                this.inheritMetadataFrom = binding["sbg:inheritMetadataFrom"].charAt(0) === "#" ?
                    binding["sbg:inheritMetadataFrom"].substr(1) :
                    binding["sbg:inheritMetadataFrom"];
            }

            if (this.eventHub) {
                this.modelListeners.push(this.eventHub.on("input.change.id", (data) => {
                    if (data.oldId === this.inheritMetadataFrom) {
                        this.inheritMetadataFrom = data.newId;
                    }
                }));
            }

            this._outputEval = new SBDraft2ExpressionModel(binding.outputEval, `${this.loc}.outputEval`, this.eventHub);
            this._outputEval.setValidationCallback(err => this.updateValidity(err));
            this.validateOutputEval();

            if (binding["sbg:metadata"] && binding["sbg:metadata"].constructor === Object) {
                Object.keys(binding["sbg:metadata"]).filter(key => key).forEach(key => {
                    const metadata = binding["sbg:metadata"][key];
                    if (metadata !== undefined) {
                        this.metadata[key] = new SBDraft2ExpressionModel(metadata, `${this.loc}["sbg:metadata"].${key}`, this.eventHub);
                        this.metadata[key].setValidationCallback(err => this.updateValidity(err));
                    }
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