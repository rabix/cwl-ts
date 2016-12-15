import {expect} from "chai";
import {CommandOutputParameterModel} from "./CommandOutputParameterModel";
import {ExpressionClass} from "../../mappings/d2sb/Expression";
import {CommandOutputBindingModel} from "./CommandOutputBindingModel";

describe("CommandOutputParameterModel", () => {
    describe("constructor", () => {
        it("Should initialize with an empty constructor", () => {
            const out = new CommandOutputParameterModel();
            expect(out).to.not.be.undefined;
        });

        it("Should have a glob object if instantiated without params", () => {
            const out = new CommandOutputParameterModel();
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

            const out = new CommandOutputParameterModel(obj);
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

            const out = new CommandOutputParameterModel(obj);
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

            const out = new CommandOutputParameterModel(obj);
            expect(out.serialize()).to.deep.equal(obj);
        });

        it("Should remove secondaryFiles if type is not file", () => {
            const out = new CommandOutputParameterModel({
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

            const out = new CommandOutputParameterModel(obj);
            const binding = {
                secondaryFiles: [".txt", ".bai"],
                glob: "*.txt"
            };

            out.updateOutputBinding(new CommandOutputBindingModel(binding));
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

        it ("Should clear outputBinding", () => {
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

            const out = new CommandOutputParameterModel(obj);

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
        })
    });
});