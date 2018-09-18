import {ValidationBase} from "../helpers/validation/ValidationBase";
import {ExpressionModel} from "./ExpressionModel";
import {Serializable} from "../interfaces/Serializable";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {EventHub} from "../helpers/EventHub";
import {ErrorCode} from "../helpers/validation/ErrorCode";

export abstract class DirentModel extends ValidationBase implements Serializable<any> {
    entry: ExpressionModel;
    entryName: ExpressionModel;
    writable: boolean;

    customProps: any = {};

    constructor(loc?: string, protected eventHub?: EventHub) {
        super(loc);
    }

    serialize(): any {
        new UnimplementedMethodException("serialize",  "DirentModel");
        return null;
    }

    deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize",  "DirentModel");
    }

    validate(context: any): Promise<any> {
        this.clearIssue(ErrorCode.ALL);

        return Promise.all([this.entry.validate(context), this.entryName.validate(context)]);
    }
}