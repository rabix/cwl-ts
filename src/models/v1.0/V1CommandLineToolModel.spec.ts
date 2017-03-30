import {expect, assert} from "chai";
import {V1CommandLineToolModel} from "./V1CommandLineToolModel";
import { CommandLineTool } from "../../mappings/v1.0/CommandLineTool";
import { CommandLinePart } from "../helpers/CommandLinePart";

function runTest(app: CommandLineTool, job: any, expected: CommandLinePart[], done) {
    let model = new V1CommandLineToolModel(app);
    model.setJob(job);
    model.setRuntime({"cores": 4})
    model.generateCommandLineParts().then((result) => {
        let resStr = result.map(
            (part) => {return part.value}
        ).filter( (part) => {return part !== ""});

        expect(resStr.join(" ")).to.equals(expected.join(" "));
    }).then(done, done);
}

function makeTests(specPath: string) {
    var YAML = require("js-yaml");
    var fs = require("fs");
    var path = require('path');
    var spec = fs.readFileSync(specPath);
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
        var path = require('path');
        var specPath = path.join(__dirname, '../../../src/tests/cli-conformance/conformance-test-v1.yaml');
        makeTests(specPath);
    });
});
