import {ExpressionEvaluator} from "./ExpressionEvaluator";
import {expect} from "chai";

describe("ExpressionEvaluator", () => {
    describe("grabExpressions", () => {
        it("should push only token for string literal", () => {
            let tokens = ExpressionEvaluator.grabExpressions("this is just a string");
            expect(tokens).to.have.length(1);
            expect(tokens[0].value).to.equal("this is just a string");
            expect(tokens[0].type).to.equal("literal");
        });

        it("should push token for string literal if it doesn't have correct syntax for expr or func", () => {
            let tokens = ExpressionEvaluator.grabExpressions("this is $ ( still just a string");
            expect(tokens).to.have.length(1);
            expect(tokens[0].value).to.equal("this is $ ( still just a string");
            expect(tokens[0].type).to.equal("literal");
        });

        it("should grab a function", () => {
            let tokens = ExpressionEvaluator.grabExpressions("string $(22)");
            expect(tokens).to.have.length(2);
            expect(tokens[0].value).to.equal("string ");
            expect(tokens[0].type).to.equal("literal");

            expect(tokens[1].value).to.equal("$(22)");
            expect(tokens[1].type).to.equal("func");
        });

        it("should grab an expression with string literal", () => {
            let tokens = ExpressionEvaluator.grabExpressions("string ${22}");
            expect(tokens).to.have.length(2);
            expect(tokens[0].value).to.equal("string ");
            expect(tokens[0].type).to.equal("literal");

            expect(tokens[1].value).to.equal("${22}");
            expect(tokens[1].type).to.equal("expr");
        });

        it("should grab a single expression", () => {
            let tokens = ExpressionEvaluator.grabExpressions("${43}");
            expect(tokens).to.have.length(1);
            expect(tokens[0].value).to.equal("${43}");
            expect(tokens[0].type).to.equal("expr");
        });


        it("should grab two expressions", () => {
            let tokens = ExpressionEvaluator.grabExpressions("${43}${22}");
            expect(tokens).to.have.length(2);
            expect(tokens[0].value).to.equal("${43}");
            expect(tokens[0].type).to.equal("expr");

            expect(tokens[1].value).to.equal("${22}");
            expect(tokens[1].type).to.equal("expr");
        });

        it("should grab a function with string literal", () => {
            let tokens = ExpressionEvaluator.grabExpressions("string $(22)");
            expect(tokens).to.have.length(2);
            expect(tokens[0].value).to.equal("string ");
            expect(tokens[0].type).to.equal("literal");

            expect(tokens[1].value).to.equal("$(22)");
            expect(tokens[1].type).to.equal("func");
        });

        it("should grab two functions", () => {
            let tokens = ExpressionEvaluator.grabExpressions("$(43)$(22)");
            expect(tokens).to.have.length(2);
            expect(tokens[0].value).to.equal("$(43)");
            expect(tokens[0].type).to.equal("func");

            expect(tokens[1].value).to.equal("$(22)");
            expect(tokens[1].type).to.equal("func");
        });

        it("should be able to evaluate a nested expression", () => {
            let tokens = ExpressionEvaluator.grabExpressions("${if (true) {return false;}}");

            expect(tokens).to.have.length(1);
            expect(tokens[0].value).to.equal("${if (true) {return false;}}");
            expect(tokens[0].type).to.equal("expr");
        });

        it("should be able to evaluate a nested function", () => {
            let tokens = ExpressionEvaluator.grabExpressions("$(function() {if (true) {return false;}})");

            expect(tokens).to.have.length(1);
            expect(tokens[0].value).to.equal("$(function() {if (true) {return false;}})");
            expect(tokens[0].type).to.equal("func");
        });

        it("should thrown an exception for improperly written expression", () => {
            expect(ExpressionEvaluator.grabExpressions.bind(null, "$(function() {if (true) {return false;}}")).to.throw("Invalid expression");
        });

        it("should allow for dollar signs if they're escaped", () => {
            let tokens = ExpressionEvaluator.grabExpressions("\\${ escaped");

            expect(tokens).to.have.length(1);
            expect(tokens[0].value).to.equal("\\${ escaped");
        });
    });
});