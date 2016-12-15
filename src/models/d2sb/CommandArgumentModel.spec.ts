import {expect} from "chai";
import {CommandArgumentModel} from "./CommandArgumentModel";
import {ExpressionModel} from "./ExpressionModel";

describe("CommandArgumentModel d2sb", () => {
    describe("constructor", () => {
        it("Should initialize if constructor has no parameters", () => {
            const arg = new CommandArgumentModel();
            expect(arg).to.not.be.undefined;
        });

        it("Should have properties if constructor has no parameters", () => {
            const arg = new CommandArgumentModel();
            expect(arg).to.not.be.undefined;

            expect(arg.valueFrom).to.not.be.undefined;
            expect(arg.valueFrom).to.be.instanceOf(ExpressionModel);
        });

    });

    describe("toString", () => {
        it("Should correctly encode toString of valueFrom script", () => {
            const arg = new CommandArgumentModel({
                "separate": true,
                "prefix": "--seqType",
                "valueFrom": {
                    "engine": "#cwl-js-engine",
                    "class": "Expression",
                    "script": "{\n  fext = $job.inputs.reads[0].file_extension\n  if (['FASTA', 'FA', 'FASTA.GZ', 'FA.GZ'].indexOf(fext) >= 0)\n  {\n    return 'fa'\n  }\n  else\n  {\n    return 'fq'\n  }\n}"
                }
            });
            expect(arg.toString()).to.equal("{\n  fext = $job.inputs.reads[0].file_extension\n  if (['FASTA', 'FA', 'FASTA.GZ', 'FA.GZ'].indexOf(fext) >= 0)\n  {\n    return 'fa'\n  }\n  else\n  {\n    return 'fq'\n  }\n}");
        });

        it("Should correctly encode toString of string value", () => {
            const arg = new CommandArgumentModel("argument");

            expect(arg.toString()).to.equal("argument");
        });
    });

    describe("getCommandPart", () => {
        it("Should handle arg with just a prefix", () => {
            let arg  = new CommandArgumentModel({prefix: "--p"});
            let part = arg.getCommandPart();
            expect(part.value).to.equal("--p");
        });

        it("Should handle arg with a prefix and value from", () => {
            let arg  = new CommandArgumentModel({prefix: "--p", valueFrom: "value"});
            let part = arg.getCommandPart();
            expect(part.value).to.equal("--p value")
        });

        it("Should handle arg that is a string", () => {
            let arg  = new CommandArgumentModel("--prefix");
            let part = arg.getCommandPart();
            expect(part.value).to.equal("--prefix");
        });

        it("Should handle arg that has expression", () => {
            let arg  = new CommandArgumentModel({
                prefix: "--prefix", valueFrom: {
                    "class": "Expression",
                    script: "3 + 3",
                    engine: ""
                }
            });
            let part = arg.getCommandPart();
            expect(part.value).to.equal("--prefix 6");
        });

        it("Should handle arg that has expression with inputs", () => {
            const arg  = new CommandArgumentModel({
                valueFrom: {
                    "class": "Expression",
                    script: "$job.file.path",
                    engine: ""
                }
            });
            const part = arg.getCommandPart({file: {path: "foo.bar.baz"}});
            expect(part.value).to.equal("foo.bar.baz");
        });
    });
});