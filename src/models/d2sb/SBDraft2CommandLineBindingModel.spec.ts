import {expect} from "chai";
import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {ExpressionClass} from "../../mappings/d2sb/Expression";
import {ExpressionEvaluator} from "../helpers/ExpressionEvaluator";
import {JSExecutor} from "../helpers/JSExecutor";
import {SBDraft2CommandLineBindingModel} from "./SBDraft2CommandLineBindingModel";

describe("SBDraft2CommandLineBindingModel d2sb", () => {
    describe("updateValidity", () => {
        beforeEach(() => {
            ExpressionEvaluator.evaluateExpression = JSExecutor.evaluate;
        });

        it("Should be invalid if valueFrom is invalid", (done) => {
            const binding = new SBDraft2CommandLineBindingModel({
                valueFrom: {
                    "class": "Expression",
                    engine: "#cwl-js-engine",
                    script: "---"
                }
            }, "binding");

            binding.validate(<any> {}).then(() => {
                expect(binding.valueFrom.errors).to.not.be.empty;
                expect(binding.errors).to.not.be.empty;
                expect(binding.errors[0].message).to.contain("Unexpected");
            }).then(done, done);
        });
    });

    describe("serialize", () => {
        it("Should serialize binding with valueFrom", () => {
            const data    = {
                position: 0,
                valueFrom: {
                    "class": <ExpressionClass> "Expression",
                    engine: "#cwl-js-engine",
                    script: "---"
                }
            };
            const binding = new SBDraft2CommandLineBindingModel(data);

            expect(binding.serialize()).to.deep.equal(data);
        });

        it("Should serialize only prefix", () => {
            const data    = {prefix: "--pr", position: 0};
            const binding = new SBDraft2CommandLineBindingModel(<CommandLineBinding>data);

            expect(binding.serialize()).to.deep.equal(data);
        });

        it("Should serialize binding with customProps", () => {
            const data    = {
                position: 0,
                valueFrom: {
                    "class": <ExpressionClass> "Expression",
                    engine: "#cwl-js-engine",
                    script: "---"
                },
                "pref:custom": {
                    complex: "value",
                    arr: [2, 3, 4, 5]
                }
            };
            const binding = new SBDraft2CommandLineBindingModel(<CommandLineBinding>data);

            expect(binding.serialize()).to.deep.equal(data);
        });

        it("Should serialize all properties correctly", () => {
            const data    = {
                valueFrom: {
                    "class": <ExpressionClass> "Expression",
                    engine: "#cwl-js-engine",
                    script: "---"
                },
                position: 3,
                prefix: "--prefix",
                separate: true,
                itemSeparator: ",",
                loadContents: true
            };
            const binding = new SBDraft2CommandLineBindingModel(<CommandLineBinding>data);

            expect(binding.serialize()).to.deep.equal(data);
        });
    });
});
