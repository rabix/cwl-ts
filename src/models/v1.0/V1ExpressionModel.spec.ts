import {expect} from "chai";
import {V1ExpressionModel} from "./V1ExpressionModel";

describe("V1ExpressionModel", () => {

    describe("clone", () => {
        it("Should clone an expression model with simple string value", () => {
            const value = "{}";

            const expr = new V1ExpressionModel();
            expr.setValue(value, "expression");
            expr.loc = "loc1";

            const exprClone = expr.clone();

            expect(expr.serialize()).to.equal(exprClone.serialize());
            expect(expr.loc).to.equal(exprClone.loc);
        });

        it("Should clone an expression model with expression value", () => {
            const value = "string";

            const expr = new V1ExpressionModel();
            expr.setValue(value, "string");
            expr.loc = "loc2";

            const exprClone = expr.clone();

            expect(expr.serialize()).to.equal(exprClone.serialize());
            expect(expr.loc).to.equal(exprClone.loc);
        });
    });
});
