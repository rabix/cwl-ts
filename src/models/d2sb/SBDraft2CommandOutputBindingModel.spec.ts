import {expect} from "chai";
import {SBDraft2CommandOutputBindingModel} from "./SBDraft2CommandOutputBindingModel";
import {ExpressionClass} from "../../mappings/d2sb/Expression";
import {SBDraft2ExpressionModel} from "./SBDraft2ExpressionModel";

describe("SBDraft2CommandOutputBindingModel", () => {
    describe("constructor", () => {
        it("should create model from blank object", () => {
            const bind = new SBDraft2CommandOutputBindingModel();

            expect(bind).to.have.property("glob");
            expect(bind).to.have.property("loadContents");
            expect(bind).to.have.property("metadata");
            expect(bind).to.have.property("inheritMetadataFrom");
            expect(bind).to.have.property("outputEval");

            expect(bind.serialize().glob).to.be.undefined;
        });

        it("should create model from a populated object", () => {
            const obj  = {
                glob: "*.bowtie.csorted.bam",
                "sbg:inheritMetadataFrom": "#reads"
            };
            const bind = new SBDraft2CommandOutputBindingModel(obj);
            expect(bind.serialize()).to.deep.equal(obj);
        });

        it("should create model when object has expression in glob", () => {
            const obj = {
                glob: {
                    script: "$job.inputs.input_bam_file.path\n \n",
                    engine: "#cwl-js-engine",
                    "class": <ExpressionClass> "Expression"
                },
                "sbg:inheritMetadataFrom": "#input_bam_file"
            };

            const bind = new SBDraft2CommandOutputBindingModel(obj);
            expect(bind.serialize()).to.deep.equal(obj);
        });
    });

    describe("metadata", () => {
        it("should not serialize metadata if key or value is blank", () => {

            let bind = new SBDraft2CommandOutputBindingModel({}, "binding");
            bind.metadata = {"": new SBDraft2ExpressionModel("text"), "data": new SBDraft2ExpressionModel("")};

            expect(Object.keys(bind.serialize()["sbg:metadata"])).empty;
        });

        it("should not deserialize metadata if key or value is blank", () => {

            let bind = new SBDraft2CommandOutputBindingModel({}, "binding");

            const metadata = {"": "text", "data": undefined};
            bind.deserialize({["sbg:metadata"]: metadata});

            expect(Object.keys(bind.metadata)).empty;
        });
    });

    describe("secondaryFiles", () => {
        it("should not serialize secondaryFiles if array is blank", () => {
            const obj = {
                glob: "*.txt"
            };

            const bind = new SBDraft2CommandOutputBindingModel(obj, "binding");

            expect(bind.serialize().secondaryFiles).to.be.undefined;
            expect(bind.serialize()).to.not.haveOwnProperty("secondaryFiles");
        });
    });

    describe("outputEval", () => {
        it("should display error if outputEval is not an expression", () => {
            const bind = new SBDraft2CommandOutputBindingModel({}, "binding");

            bind.updateOutputEval(new SBDraft2ExpressionModel("string value"));
            expect(bind.errors).to.not.be.empty;
            expect(bind.errors[0].loc).to.equal("binding.outputEval");
        });

        it("should set outputEval that is an expression", () => {
            const bind = new SBDraft2CommandOutputBindingModel({}, "binding");
            const expr = {
                "class": <ExpressionClass> "Expression",
                engine: "",
                script: "3 + 3"
            };

            bind.updateOutputEval(new SBDraft2ExpressionModel(expr));
            expect(bind.errors).to.be.empty;

            expect(bind.serialize()).to.deep.equal({
                outputEval: expr
            });
        });

        it("should not serialize blank outputEval", () => {
            const bind = new SBDraft2CommandOutputBindingModel({}, "binding");
            const expr = {
                "class": <ExpressionClass> "Expression",
                engine: "",
                script: ""
            };

            bind.updateOutputEval(new SBDraft2ExpressionModel(expr));

            expect(bind.serialize()).to.deep.equal({});
        })
    });
});