import {EventHub} from "../helpers/EventHub";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {Serializable} from "../interfaces/Serializable";
import {DirentModel} from "./DirentModel";
import {ProcessRequirementModel} from "./ProcessRequirementModel";
import {ExpressionModel} from "./ExpressionModel";
import {ErrorCode} from "../helpers/validation/ErrorCode";

export abstract class CreateFileRequirementModel extends ProcessRequirementModel implements Serializable<any> {
    class: string;
    listing: Array<DirentModel| ExpressionModel>;

    constructor(loc?: string, protected eventHub?: EventHub) {
        super(loc);
    }

    public addDirent(def?: any): DirentModel {
        new UnimplementedMethodException("addDirent", "CreateFileRequirementModel");
        return null;
    }

    public addExpression(e: ExpressionModel | string) {
        new UnimplementedMethodException("addExpression", "CreateFileRequirementModel");
        return null;
    }

    validate(context: any): Promise<any> {
        this.clearIssue(ErrorCode.ALL);

        return Promise.all(
            this.listing.map(dir => dir.validate(context)))
            .then(() => this.issues, () => this.issues)
    }
}