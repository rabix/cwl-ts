import {ExpressionModel} from "../generic/ExpressionModel";

export class V1ExpressionModel extends ExpressionModel {

    //@todo implement all methods

    public serialize(): any {
        return super.serialize();
    }

    public deserialize(attr: any): void {
        super.deserialize(attr);
    }

    constructor(expression?: string, loc?: string) {
        super(loc);

        if (expression) this.deserialize(expression);
    }
}