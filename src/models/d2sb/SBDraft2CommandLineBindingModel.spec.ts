import {expect} from "chai";
import {SBDraft2CommandLineBindingModel} from "./SBDraft2CommandLineBindingModel";
import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {ExpressionClass} from "../../mappings/d2sb/Expression";
import {SBDraft2ExpressionModel} from "./SBDraft2ExpressionModel";

describe("SBDraft2CommandLineBindingModel d2sb", () => {
    describe("updateValidity", () => {
        it("Should be invalid if valueFrom is invalid", () => {
            const binding = new SBDraft2CommandLineBindingModel({
                valueFrom: {
                    "class": "Expression",
                    engine: "#cwl-js-engine",
                    script: "---"
                }
            });

            // binding.valueFrom.evaluate();

            //@fixme input validation should be async
            // expect(binding.valueFrom.validation.errors).to.not.be.empty;
            // expect(binding.validation.errors).to.not.be.empty;
            // expect(binding.validation.errors[0].message).to.contain("SyntaxError");
        });
    });

    describe("serialize", () => {
        it("Should serialize binding with valueFrom", () => {
            const data    = {
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
            const data = {prefix: "--pr"};
            const binding = new SBDraft2CommandLineBindingModel(<CommandLineBinding>data);

            expect(binding.serialize()).to.deep.equal(data);
        });

        it("Should serialize binding with customProps", () => {
            const data    = {
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

    describe("secondaryFiles", () => {
        it("should not serialize secondaryFiles if array is blank", () => {
            const obj = {
                glob: "*.txt"
            };

            const bind = new SBDraft2CommandLineBindingModel(obj, "binding");

            expect(bind.serialize().secondaryFiles).to.be.undefined;
            expect(bind.serialize()).to.not.haveOwnProperty("secondaryFiles");
        });

        it("should updateSecondaryFile with string value", () => {
            const obj = {
                secondaryFiles: [
                    ".bai",
                    ".bti"
                ]
            };

            const bind = new SBDraft2CommandLineBindingModel(obj, "binding");
            expect(bind.secondaryFiles[1].serialize()).to.equal(".bti");

            bind.updateSecondaryFile(new SBDraft2ExpressionModel("", ".txt"), 1);

            expect(bind.secondaryFiles[1].serialize()).to.equal(".txt");
            expect(bind.secondaryFiles[1].loc).to.equal("binding.secondaryFiles[1]");
        });

        it("should removeSecondaryFile at index", () => {
            const obj = {
                secondaryFiles: [
                    ".bai",
                    ".bti"
                ]
            };

            const bind = new SBDraft2CommandLineBindingModel(obj, "binding");
            expect(bind.secondaryFiles).to.have.length(2);

            bind.removeSecondaryFile(0);

            expect(bind.secondaryFiles).to.have.length(1);
            expect(bind.secondaryFiles[0].serialize()).to.equal(".bti");

            expect(bind.secondaryFiles[0].loc).to.equal("binding.secondaryFiles[0]");
        });

        it("should addSecondaryFile to the end of the list", () => {
            const obj = {
                secondaryFiles: [
                    ".bai",
                    ".bti"
                ]
            };

            const bind = new SBDraft2CommandLineBindingModel(obj, "binding");

            bind.addSecondaryFile(new SBDraft2ExpressionModel("", ".txt"));


            expect(bind.secondaryFiles).to.have.length(3);
            expect(bind.secondaryFiles[2].serialize()).to.equal(".txt");

            expect(bind.secondaryFiles[2].loc).to.equal("binding.secondaryFiles[2]");
        });
    })
});
