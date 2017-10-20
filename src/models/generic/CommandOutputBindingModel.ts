import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {ExpressionModel} from "./ExpressionModel";
import {EventHub} from "../helpers/EventHub";

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

    validate(context): Promise<any> {

        this.cleanValidity();
        const promises = [];

        if (this._glob && this._glob.serialize() === undefined) {
            this._glob.updateValidity({
                [`${this.loc}.glob`]: {
                    message: "Glob should be specified",
                    type: "warning"
                }
            }, true);
        } else {
            promises.push(this._glob.validate(context));
        }

        if (this._outputEval) {
            promises.push(this._outputEval.validate(context));
        }

        return Promise.all(promises).then(() => this.issues);
    }
}