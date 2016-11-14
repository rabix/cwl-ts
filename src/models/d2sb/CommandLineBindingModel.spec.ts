import {expect} from "chai";
import {CommandLineBindingModel} from "./CommandLineBindingModel";

describe("CommandLineBindingModel", () => {
    describe("updateValidity", () => {
        it("Should be invalid if valueFrom is invalid", () => {
            const binding = new CommandLineBindingModel("", {
                valueFrom: {
                    "class": "Expression",
                    engine: "#cwl-js-engine",
                    script: "---"
                }
            });

            binding.valueFrom.evaluate();

            expect(binding.valueFrom.validation.errors).to.not.be.empty;
            expect(binding.validation.errors).to.not.be.empty;
            expect(binding.validation.errors[0].message).to.contain("SyntaxError");
        });
    });
});
