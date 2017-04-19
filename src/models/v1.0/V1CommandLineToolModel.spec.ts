import {expect, assert} from "chai";
import {V1CommandLineToolModel} from "./V1CommandLineToolModel";
import { CommandLineTool } from "../../mappings/v1.0/CommandLineTool";
import { CommandLinePart } from "../helpers/CommandLinePart";

function runTest(app: CommandLineTool, job: any, expected: CommandLinePart[], done) {
    let model = new V1CommandLineToolModel(app, "document");
    model.setJobInputs(job);
    model.setRuntime({"cores": 4});
    model.generateCommandLineParts().then((result) => {
        let resStr = result.map(
            (part) => {return part.value}
        ).filter( (part) => {return part !== ""});

        expect(resStr.join(" ")).to.equals(expected.join(" "));
    }).then(done, done);
}

function makeTests(specPath: string) {
    const YAML = require("js-yaml");
    const fs = require("fs");
    const path = require('path');
    const spec = fs.readFileSync(specPath);
    let tests = YAML.safeLoad(spec);
    let testsRoot = path.dirname(specPath);
    
    for (let test of tests) {
        it("should pass " + test["doc"], (done) => {
            let tool = YAML.safeLoad(fs.readFileSync(path.join(testsRoot, test["tool"])));
            let job = YAML.safeLoad(fs.readFileSync(path.join(testsRoot, test["job"])));
            runTest(tool, job, test["output"], done);
        });
    }
    
}

describe("V1CommandLineToolModel", () => {
    describe("generateCommandLineParts conformance", () => {
        const path = require('path');
        const specPath = path.join(__dirname, '../../../src/tests/cli-conformance/conformance-test-v1.yaml');
        makeTests(specPath);
    });

    describe("jobManagement", () => {
        it("should add mock input to job when adding input", () => {
            const model = new V1CommandLineToolModel(<any> {});

            expect(model.getContext().inputs).to.be.empty;

            model.addInput({
                id: "input",
                type: "string"
            });

            const context = model.getContext();
            expect(context.inputs).to.not.be.empty;
            expect(typeof context.inputs.input).to.equal("string");
        });

        it("should remove job value when removing input", () => {
            const model = new V1CommandLineToolModel(<any> {
                inputs: {
                    input: "string"
                }
            });

            expect(model.getContext().inputs).to.have.all.keys("input");

            model.removeInput(model.inputs[0]);
            expect(model.getContext().inputs).to.deep.equal({});
        });

        it("should change job value when changing input items type", () => {
            const model = new V1CommandLineToolModel(<any> {
                inputs: {
                    input: "File[]"
                }
            });

            const context = model.getContext();

            expect(typeof context.inputs.input[0]).to.equal("object");

            model.inputs[0].type.items = "int";

            expect(typeof context.inputs.input[0]).to.equal("number");
        });

        it("should change job value when changing input type", () => {
            const model = new V1CommandLineToolModel(<any> {
                inputs: {
                    input: "string"
                }
            });

            const context = model.getContext();

            expect(typeof context.inputs.input).to.equal("string");

            model.inputs[0].type.type = "int";

            expect(typeof context.inputs.input).to.equal("number");
        });

        it("should change job key when changing input id", () => {
            const model = new V1CommandLineToolModel(<any> {
                inputs: {
                    input: "string"
                }
            });

            const context = model.getContext();
            expect(context.inputs).to.have.all.keys("input");
            expect(typeof context.inputs.input).to.equal("string");

            expect(context.inputs.newId).to.be.undefined;
            expect(context.inputs.input).to.not.be.undefined;

            model.changeIOId(model.inputs[0], "newId");

            expect(context.inputs.input).to.be.undefined;
            expect(context.inputs.newId).to.not.be.undefined;

        });
    });
});
