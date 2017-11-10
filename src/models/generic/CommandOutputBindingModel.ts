import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {ExpressionModel} from "./ExpressionModel";
import {EventHub} from "../helpers/EventHub";
import {ErrorCode} from "../helpers/validation/ErrorCode";

export abstract class CommandOutputBindingModel extends ValidationBase implements Serializable<any> {
    hasSecondaryFiles: boolean;
    hasMetadata: boolean;
    hasInheritMetadata: boolean;

    metadata: {};
    inheritMetadataFrom: string;

    secondaryFiles: ExpressionModel[];

    glob: ExpressionModel;

    protected _glob: ExpressionModel;

    loadContents: boolean;

    outputEval: ExpressionModel;

    protected _outputEval: ExpressionModel;

    customProps: any = {};

    abstract setInheritMetadataFrom(string);

    constructor(loc?: string, protected eventHub?: EventHub) {
        super(loc);
    }

    abstract serialize(): any;

    abstract deserialize(attr: any): void;

    protected setGlob(value: ExpressionModel, exprConstructor: new (...args: any[]) => ExpressionModel) {
        let val = value.serialize();
        this._glob.clearIssue(ErrorCode.ALL);
        this._glob = new exprConstructor(val, `${this.loc}.glob`, this.eventHub);
        this._glob.setValidationCallback(err => this.updateValidity(err));
        this.validateGlob();
    }

    protected validateGlob() {
        if (!this._glob) return;

        if (this._glob.serialize() === undefined) {
            this._glob.setIssue({
                [`${this.loc}.glob`]: {
                    message: "Glob should be specified",
                    type: "warning",
                    code: ErrorCode.OUTPUT_GLOB_MISSING
                }
            }, true);
        } else {
            this._glob.clearIssue(ErrorCode.OUTPUT_GLOB_MISSING);
        }
    }

    protected setOutputEval(value: ExpressionModel, exprConstructor: new (...args: any[]) => ExpressionModel) {
        if (this._outputEval) {
            this._outputEval.clearIssue(ErrorCode.ALL);
        }
        this._outputEval = new exprConstructor(value.serialize(), `${this.loc}.outputEval`, this.eventHub);
        this._outputEval.setValidationCallback(err => this.updateValidity(err));
    }
}