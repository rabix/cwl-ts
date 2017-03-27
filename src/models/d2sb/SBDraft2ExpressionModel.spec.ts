import {expect} from "chai";
import {SBDraft2ExpressionModel} from "./SBDraft2ExpressionModel";
import {Expression} from "../../mappings/d2sb/Expression";
import {ExpressionClass} from "../../mappings/d2sb/Expression";

describe("SBDraft2ExpressionModel", () => {

    describe("constructor", () => {

        it("Should instantiate create a model with the given properties", () => {
            const expressionModel1 = new SBDraft2ExpressionModel("123");

            expect(expressionModel1.serialize()).to.equal("123");
            expect(expressionModel1.toString()).to.equal("123");

            const expressionModel2 = new SBDraft2ExpressionModel({
                "class": "Expression",
                engine: "cwl-js-engine",
                script: "1 + 2"
            });

            const expectedExpression = JSON.stringify({
                "class": "Expression",
                engine: "cwl-js-engine",
                script: "1 + 2"
            });

            expect(JSON.stringify(expressionModel2.serialize())).to.equal(expectedExpression);
            expect(expressionModel2.toString()).to.equal("1 + 2");
        });
    });

    describe("setValue", () => {
        it("should set a primitive value", () => {
            const expr = new SBDraft2ExpressionModel("");
            expr.setValue("some value", "string");

            expect(expr.serialize()).to.equal("some value");
        });

        it("should set expression script property", () => {
            const expr = new SBDraft2ExpressionModel("");
            expr.setValue("3 + 3", "expression");

            const serialized = <Expression> expr.serialize();

            expect(serialized.class).to.equal("Expression");
            expect(serialized.engine).to.equal("#cwl-js-engine");
            expect(serialized.script).to.equal("3 + 3");
        });
    });

    describe("evaluate", () => {
        it("should return value if model is string, not expression", (done) => {
            const expr = new SBDraft2ExpressionModel("value");
            expr.evaluate().then(res => {
                expect(res).to.equal("value");
            }).then(done, done);
        });

        it("should return a result for a valid expression", (done) => {
            const expr = new SBDraft2ExpressionModel("");
            expr.setValue("3 + 3", "expression");
            expect(expr.result).to.be.undefined;

            expr.evaluate().then(res => {
                expect(res).to.equal(6);
                expect(expr.result).to.equal(6);
            }).then(done, done);
        });

        it("should add a SyntaxError to model validation.errors", (done) => {
            const expr = new SBDraft2ExpressionModel("");
            expr.setValue("--", "expression");

            expect(expr.validation.errors).to.be.empty;

            expr.evaluate().then(done, () => {
                expect(expr.validation.errors).to.not.be.empty;
                expect(expr.validation.errors[0].message).to.contain("SyntaxError");
                expect(expr.validation.warnings).to.be.empty;
            }).then(done, done);
        });

        it("should add ReferenceError to model validation.warnings", (done) => {
            const expr = new SBDraft2ExpressionModel("");
            expr.setValue("a", "expression");

            expect(expr.validation.warnings).to.be.empty;
            expr.evaluate().then(done, () => {
                expect(expr.validation.warnings).to.not.be.empty;
                expect(expr.validation.warnings[0].message).to.contain("ReferenceError");
                expect(expr.validation.errors).to.be.empty;
            }).then(done, done);
        });
    });

    describe("serialize", () => {
        it("Should serialize a simple string", () => {
            const data = "simple string";
            const expr = new SBDraft2ExpressionModel(data);
            expect(expr.serialize()).to.equal(data);
        });

        it("Should serialize an expression", () => {
            const data = {
                "class": "Expression",
                engine: "#cwl-js-engine",
                script: "{ return 3 + 3 }"
            };
            const expr = new SBDraft2ExpressionModel(<Expression> data);
            expect(expr.serialize()).to.equal(data);
        });

        it("Should serialize an expression with custom properties", () => {
            const data = {
                "class": <ExpressionClass> "Expression",
                engine: "#cwl-js-engine",
                script: "{ return 3 + 3 }",
                "pref:custom": "some value"
            };
            const expr = new SBDraft2ExpressionModel(<Expression> data);
            expect(expr.serialize()).to.equal(data);
        });
    });
});
