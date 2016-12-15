import {expect} from "chai";
import {ExpressionModel} from "./ExpressionModel";
import {Expression} from "../../mappings/d2sb/Expression";
import {ExpressionClass} from "../../mappings/d2sb/Expression";

describe("ExpressionModel d2sb", () => {

    describe("constructor", () => {

        it("Should instantiate create a model with the given properties", () => {
            const expressionModel1 = new ExpressionModel("", "123");

            expect(expressionModel1.serialize()).to.equal("123");
            expect(expressionModel1.toString()).to.equal("123");

            const expressionModel2 = new ExpressionModel("", {
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
            const expr = new ExpressionModel("");
            expr.setValue("some value", "string");

            expect(expr.serialize()).to.equal("some value");
        });

        it("should set expression script property", () => {
            const expr = new ExpressionModel("");
            expr.setValue("3 + 3", "expression");

            const serialized = <Expression> expr.serialize();

            expect(serialized.class).to.equal("Expression");
            expect(serialized.engine).to.equal("#cwl-js-engine");
            expect(serialized.script).to.equal("3 + 3");
        });
    });

    describe("evaluate", () => {
        it("should return value if model is string, not expression", () => {
            const expr = new ExpressionModel("", "value");
            expect(expr.evaluate()).to.equal("value");
        });

        it("should return a result for a valid expression", () => {
            const expr = new ExpressionModel("");
            expr.setValue("3 + 3", "expression");

            expect(expr.result).to.be.undefined;
            expect(expr.evaluate()).to.equal(6);
            expect(expr.result).to.equal(6);
        });

        it("should add a SyntaxError to model validation.errors", () => {
            const expr = new ExpressionModel("");
            expr.setValue("--", "expression");

            expect(expr.validation.errors).to.be.empty;
            expect(expr.evaluate()).to.be.undefined;
            expect(expr.validation.errors).to.not.be.empty;
            expect(expr.validation.errors[0].message).to.contain("SyntaxError");
            expect(expr.validation.warnings).to.be.empty;
        });

        it("should add ReferenceError to model validation.warnings", () => {
            const expr = new ExpressionModel("");
            expr.setValue("a", "expression");

            expect(expr.validation.warnings).to.be.empty;
            expect(expr.evaluate()).to.be.undefined;
            expect(expr.validation.warnings).to.not.be.empty;
            expect(expr.validation.warnings[0].message).to.contain("ReferenceError");
            expect(expr.validation.errors).to.be.empty;

        });
    });

    describe("serialize", () => {
        it("Should serialize a simple string", () => {
            const data = "simple string";
            const expr = new ExpressionModel("", data);
            expect(expr.serialize()).to.equal(data);
        });

        it("Should serialize an expression", () => {
            const data = {
                "class": "Expression",
                engine: "#cwl-js-engine",
                script: "{ return 3 + 3 }"
            };
            const expr = new ExpressionModel("", <Expression> data);
            expect(expr.serialize()).to.equal(data);
        });

        it("Should serialize an expression with custom properties", () => {
            const data = {
                "class": <ExpressionClass> "Expression",
                engine: "#cwl-js-engine",
                script: "{ return 3 + 3 }",
                "pref:custom": "some value"
            };
            const expr = new ExpressionModel("", <Expression> data);
            expect(expr.serialize()).to.equal(data);
        });
    });
});
