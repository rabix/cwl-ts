import {expect} from "chai";
import {CommandOutputBinding} from "../../mappings/d2sb/CommandOutputBinding";
import {ExpressionClass} from "../../mappings/d2sb/Expression";
import {SBDraft2CommandOutputBindingModel} from "./SBDraft2CommandOutputBindingModel";
import {SBDraft2CommandOutputParameterModel} from "./SBDraft2CommandOutputParameterModel";

describe("SBDraft2CommandOutputParameterModel", () => {
    describe("constructor", () => {
        it("Should initialize with an empty constructor", () => {
            const out = new SBDraft2CommandOutputParameterModel();
            expect(out).to.not.be.undefined;
        });

        it("Should have a glob object if instantiated without params", () => {
            const out = new SBDraft2CommandOutputParameterModel();
            expect(out).to.not.be.undefined;
            expect(out.outputBinding.glob).to.not.be.undefined;
            expect(out.outputBinding.glob.serialize()).to.be.undefined;
        });
    });

    describe("serialize", () => {
        it("Should serialize all properties", () => {
            const obj = {
                "type": [
                    "null",
                    "File"
                ],
                "outputBinding": {
                    "glob": {
                        "script": "{\n  if($job.inputs.bams instanceof Array)\n  {\n    filename=$job.inputs.bams[0].path\n    paths=filename.split('/')\n    names=filename.split('/')[paths.length-1].split('.')\n    if($job.inputs.bams.length>1)\n    {\n    \tnames[names.length-1]='and_more.breakdancer.ctx'\n    }\n    else\n    {\n      names[names.length-1]='breakdancer.ctx'\n    }\n    \n    \n    return names.join(\".\")\n  }\n  filename=$job.inputs.bams.path\n  paths=filename.split('/')\n  names=filename.split('/')[paths.length-1].split('.')\n  names[names.length-1]='breakdancer.ctx'\n  return names.join(\".\")\n}",
                        "class": <ExpressionClass> "Expression",
                        "engine": "#cwl-js-engine"
                    }
                },
                "id": "#result",
                "label": "Result",
                "sbg:fileTypes": "CTX"
            };

            const out = new SBDraft2CommandOutputParameterModel(obj);
            expect(out.serialize()).to.deep.equal(obj);
        });

        it("Should serialize type and id", () => {
            const obj = {
                "type": [
                    "null",
                    "File"
                ],
                "id": "#result"
            };

            const out = new SBDraft2CommandOutputParameterModel(obj);
            expect(out.serialize()).to.deep.equal(obj);
        });


        it("Should serialize custom properties", () => {
            const obj = {
                "type": [
                    "null",
                    "File"
                ],
                "id": "#result",
                "label": "Result",
                "sbg:fileTypes": "CTX",
                "sbg:otherProp": {
                    complex: "object"
                }
            };

            const out = new SBDraft2CommandOutputParameterModel(obj);
            expect(out.serialize()).to.deep.equal(obj);
        });

        it("Should remove secondaryFiles if type is not file", () => {
            const out = new SBDraft2CommandOutputParameterModel({
                "type": [
                    "null",
                    "string"
                ],
                "id": "#result",
                "label": "Result",
                "sbg:fileTypes": "CTX",
                outputBinding: {
                    secondaryFiles: [".bai"],
                    loadContents: true
                }
            });
            expect(out.serialize()).to.deep.equal({
                "type": [
                    "null",
                    "string"
                ],
                "id": "#result",
                "label": "Result"
            });
        });
    });

    describe("updateOutputBinding", () => {
        it("Should accept a new outputBinding object", () => {
            const obj = {
                "type": [
                    "null",
                    "File"
                ],
                "outputBinding": {
                    "glob": {
                        "script": "{\n  if($job.inputs.bams instanceof Array)\n  {\n    filename=$job.inputs.bams[0].path\n    paths=filename.split('/')\n    names=filename.split('/')[paths.length-1].split('.')\n    if($job.inputs.bams.length>1)\n    {\n    \tnames[names.length-1]='and_more.breakdancer.ctx'\n    }\n    else\n    {\n      names[names.length-1]='breakdancer.ctx'\n    }\n    \n    \n    return names.join(\".\")\n  }\n  filename=$job.inputs.bams.path\n  paths=filename.split('/')\n  names=filename.split('/')[paths.length-1].split('.')\n  names[names.length-1]='breakdancer.ctx'\n  return names.join(\".\")\n}",
                        "class": <ExpressionClass> "Expression",
                        "engine": "#cwl-js-engine"
                    }
                },
                "id": "#result",
                "label": "Result",
                "sbg:fileTypes": "CTX"
            };

            const out     = new SBDraft2CommandOutputParameterModel(obj);
            const binding = {
                glob: "*.txt"
            };

            out.updateOutputBinding(new SBDraft2CommandOutputBindingModel(binding));
            expect(out.serialize()).to.deep.equal({
                "type": [
                    "null",
                    "File"
                ],
                "outputBinding": binding,
                "id": "#result",
                "label": "Result",
                "sbg:fileTypes": "CTX"
            });
        });

        it("Should clear outputBinding", () => {
            const obj = {
                "type": [
                    "null",
                    "File"
                ],
                "outputBinding": {
                    "glob": {
                        "script": "{\n  if($job.inputs.bams instanceof Array)\n  {\n    filename=$job.inputs.bams[0].path\n    paths=filename.split('/')\n    names=filename.split('/')[paths.length-1].split('.')\n    if($job.inputs.bams.length>1)\n    {\n    \tnames[names.length-1]='and_more.breakdancer.ctx'\n    }\n    else\n    {\n      names[names.length-1]='breakdancer.ctx'\n    }\n    \n    \n    return names.join(\".\")\n  }\n  filename=$job.inputs.bams.path\n  paths=filename.split('/')\n  names=filename.split('/')[paths.length-1].split('.')\n  names[names.length-1]='breakdancer.ctx'\n  return names.join(\".\")\n}",
                        "class": <ExpressionClass> "Expression",
                        "engine": "#cwl-js-engine"
                    }
                },
                "id": "#result",
                "label": "Result",
                "sbg:fileTypes": "CTX"
            };

            const out = new SBDraft2CommandOutputParameterModel(obj);

            out.updateOutputBinding(null);
            expect(out.serialize()).to.deep.equal({
                "type": [
                    "null",
                    "File"
                ],
                "id": "#result",
                "label": "Result",
                "sbg:fileTypes": "CTX"
            });
        });

        it("Should regulate secondaryFiles", () => {
            it("should updateSecondaryFiles with string values", () => {
                const obj = {
                    id: "output",
                    type: ["File"],
                    outputBinding: {
                        secondaryFiles: [
                            ".bai",
                            ".bti"
                        ]
                    }
                };

                const output = new SBDraft2CommandOutputParameterModel(obj, "output");
                expect(output.secondaryFiles[1].serialize()).to.equal(".bti");

                output.updateSecondaryFiles([
                    ".bai",
                    ".txt"
                ]);

                expect(output.secondaryFiles[1].serialize()).to.equal(".txt");
                expect(output.secondaryFiles[1].loc).to.equal("output.outputBinding.secondaryFiles[1]");
            });

            it("should removeSecondaryFile at index", () => {
                const obj = {
                    id: "output",
                    type: ["File"],
                    outputBinding: {
                        secondaryFiles: [
                            ".bai",
                            ".bti"
                        ]
                    }
                };

                const output = new SBDraft2CommandOutputParameterModel(obj, "output");
                expect(output.secondaryFiles).to.have.length(2);

                output.removeSecondaryFile(0);

                expect(output.secondaryFiles).to.have.length(1);
                expect(output.secondaryFiles[0].serialize()).to.equal(".bti");

                expect(output.secondaryFiles[0].loc).to.equal("output.outputBinding.secondaryFiles[0]");
            });

            it("should addSecondaryFile to the end of the list", () => {
                const obj = {
                    id: "output",
                    type: ["File"],
                    outputBinding: {
                        secondaryFiles: [
                            ".bai",
                            ".bti"
                        ]
                    }
                };

                const output = new SBDraft2CommandOutputParameterModel(obj, "output");
                output.addSecondaryFile(".txt");


                expect(output.secondaryFiles).to.have.length(3);
                expect(output.secondaryFiles[2].serialize()).to.equal(".txt");

                expect(output.secondaryFiles[2].loc).to.equal("binding.secondaryFiles[2]");
            });

            it("should not serialize secondaryFiles if array is blank", () => {
                const obj = {
                    id: "output",
                    type: ["File"],
                    outputBinding: {
                        glob: ".txt",
                        secondaryFiles: []
                    }
                };

                const bind = new SBDraft2CommandOutputParameterModel(obj, "binding");

                expect((<CommandOutputBinding>bind.serialize().outputBinding).secondaryFiles).to.be.undefined;
                expect(bind.serialize()).to.not.haveOwnProperty("secondaryFiles");
            });
        });
    });
});