import {expect} from "chai";
import {CommandOutputBindingModel} from "./CommandOutputBindingModel";
import {ExpressionClass} from "../../mappings/d2sb/Expression";
import {ExpressionModel} from "./ExpressionModel";

describe("CommandOutputBindingModel", () => {
    describe("constructor", () => {
        it("should create model from blank object", () => {
            const bind = new CommandOutputBindingModel();

            expect(bind).to.have.property("glob");
            expect(bind).to.have.property("loadContents");
            expect(bind).to.have.property("metadata");
            expect(bind).to.have.property("secondaryFiles");
            expect(bind).to.have.property("inheritMetadataFrom");
            expect(bind).to.have.property("outputEval");

            expect(bind.serialize().glob).to.be.undefined;
        });

        it("should create model from a populated object", () => {
            const obj  = {
                glob: "*.bowtie.csorted.bam",
                "sbg:inheritMetadataFrom": "#reads"
            };
            const bind = new CommandOutputBindingModel(obj);
            expect(bind.serialize()).to.deep.equal(obj);
        });

        it("should create model when object has expression in glob", () => {
            const obj = {
                glob: {
                    script: "$job.inputs.input_bam_file.path\n \n",
                    engine: "#cwl-js-engine",
                    "class": <ExpressionClass> "Expression"
                },
                secondaryFiles: [
                    ".bai",
                    ".bti"
                ],
                "sbg:inheritMetadataFrom": "#input_bam_file"
            };

            const bind = new CommandOutputBindingModel(obj);
            expect(bind.serialize()).to.deep.equal(obj);
        });

        it("should create model when object has expression in secondaryFiles", () => {
            const obj = {
                glob: {
                    script: "$job.inputs.input_bam_file.path\n \n",
                    engine: "#cwl-js-engine",
                    "class": <ExpressionClass> "Expression"
                },
                secondaryFiles: [
                    {
                        script: ".bai",
                        engine: "#cwl-js-engine",
                        "class": <ExpressionClass> "Expression"
                    },
                    ".bti"
                ],
                "sbg:inheritMetadataFrom": "#input_bam_file"
            };

            const bind = new CommandOutputBindingModel(obj);
            expect(bind.serialize()).to.deep.equal(obj);
        });
    });

    describe("secondaryFiles", () => {
        it("should not serialize secondaryFiles if array is blank", () => {
            const obj = {
                glob: "*.txt"
            };

            const bind = new CommandOutputBindingModel(obj, "binding");

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

            const bind = new CommandOutputBindingModel(obj, "binding");
            expect(bind.secondaryFiles[1].serialize()).to.equal(".bti");

            bind.updateSecondaryFile(new ExpressionModel("", ".txt"), 1);

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

            const bind = new CommandOutputBindingModel(obj, "binding");
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

            const bind = new CommandOutputBindingModel(obj, "binding");

            bind.addSecondaryFile(new ExpressionModel("", ".txt"));


            expect(bind.secondaryFiles).to.have.length(3);
            expect(bind.secondaryFiles[2].serialize()).to.equal(".txt");

            expect(bind.secondaryFiles[2].loc).to.equal("binding.secondaryFiles[2]");
        });
    });

    describe("outputEval", () => {
        it("should display error if outputEval is not an expression", () => {
            const bind = new CommandOutputBindingModel({}, "binding");

            bind.updateOutputEval(new ExpressionModel("", "string value"));
            expect(bind.validation.errors).to.not.be.empty;
            expect(bind.validation.errors[0].loc).to.equal("binding.outputEval");
        });

        it("should set outputEval that is an expression", () => {
            const bind = new CommandOutputBindingModel({}, "binding");
            const expr = {
                "class": <ExpressionClass> "Expression",
                engine: "",
                script: "3 + 3"
            };

            bind.updateOutputEval(new ExpressionModel("", expr));
            expect(bind.validation.errors).to.be.empty;

            expect(bind.serialize()).to.deep.equal({
                outputEval: expr
            });
        });

        it("should not serialize blank outputEval", () => {
            const bind = new CommandOutputBindingModel({}, "binding");
            const expr = {
                "class": <ExpressionClass> "Expression",
                engine: "",
                script: ""
            };

            bind.updateOutputEval(new ExpressionModel("", expr));

            expect(bind.serialize()).to.deep.equal({});
        })
    });
});