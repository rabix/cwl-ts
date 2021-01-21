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

    glob: ExpressionModel | Array<string>;

    protected _glob: ExpressionModel | Array<string>;

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

    protected validateGlob() {
        if (!this._glob) return;

        if (this._glob instanceof ExpressionModel) {
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
    }

    protected setOutputEval(value: ExpressionModel, exprConstructor: new (...args: any[]) => ExpressionModel) {
        if (this._outputEval) {
            this._outputEval.clearIssue(ErrorCode.ALL);
        }
        this._outputEval = new exprConstructor(value.serialize(), `${this.loc}.outputEval`, this.eventHub);
        this._outputEval.setValidationCallback(err => this.updateValidity(err));
    }

    protected setGlobExpression(expression: ExpressionModel, exprConstructor: new (...args: any[]) => ExpressionModel) {
        if (this._glob instanceof ExpressionModel) {
            this._glob.clearIssue(ErrorCode.ALL);
        }

        this._glob = new exprConstructor(expression.serialize(), `${this.loc}.glob`, this.eventHub);
        this._glob.setValidationCallback(err => this.updateValidity(err));
        this.validateGlob();
    }

}
