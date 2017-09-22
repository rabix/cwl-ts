import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {ExpressionModel} from "./ExpressionModel";
import {EventHub} from "../helpers/EventHub";

export class CommandOutputBindingModel extends ValidationBase implements Serializable<any> {
    hasSecondaryFiles: boolean;
    hasMetadata: boolean;
    hasInheritMetadata: boolean;

    secondaryFiles: ExpressionModel[];

    glob: ExpressionModel;

    protected _glob: ExpressionModel;

    loadContents: boolean;

    outputEval: ExpressionModel;

    protected _outputEval: ExpressionModel;

    customProps: any = {};

    constructor(loc?: string, protected eventHub?: EventHub) {
        super(loc);
    }

    serialize(): any {
        new UnimplementedMethodException("serialize", "CommandOutputBindingModel");
        return undefined;
    }

    deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize", "CommandOutputBindingModel");
    }

    validate(context): Promise<any> {

        this.cleanValidity();
        const promises = [];

        if (this._glob && this._glob.serialize() === undefined) {
            this._glob.setIssue({
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