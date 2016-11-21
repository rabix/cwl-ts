import {expect} from "chai";
import {CommandLineBindingModel} from "./CommandLineBindingModel";
import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";

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

    describe("serialize", () => {
        it("Should serialize binding with valueFrom", () => {
            const data    = {
                valueFrom: {
                    "class": "Expression",
                    engine: "#cwl-js-engine",
                    script: "---"
                }
            };
            const binding = new CommandLineBindingModel("", <CommandLineBinding>data);

            expect(binding.serialize()).to.deep.equal(data);
        });

        it("Should serialize binding with customProps", () => {
            const data    = {
                valueFrom: {
                    "class": "Expression",
                    engine: "#cwl-js-engine",
                    script: "---"
                },
                "pref:custom": {
                    complex: "value",
                    arr: [2, 3, 4, 5]
                }
            };
            const binding = new CommandLineBindingModel("", <CommandLineBinding>data);

            expect(binding.serialize()).to.deep.equal(data);
        })
    })
});
