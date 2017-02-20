import {expect} from "chai";
import {CommandLineParsers} from "./CommandLineParsers";
import {ExpressionModel} from "../d2sb/ExpressionModel";
import {SBDraft2CommandInputParameterModel} from "../d2sb/SBDraft2CommandInputParameterModel";

describe("CommandLineParsers", () => {
    describe("streams", () => {

        it("should show a warning if stdout expression is invalid", (done) => {
            const stdout = new ExpressionModel("", {
                script: "job",
                engine: "",
                "class": "Expression"
            });

            CommandLineParsers.stream(stdout, {}, null, {}, "stdout", "stdout").then(function (res) {
                expect(res.type).to.equal("warning");
            }).then(done, done);
        });
    });

    describe("array", () => {
        it("should evaluate an array of files without valueFrom", (done) => {
            const input = new SBDraft2CommandInputParameterModel({
                "type": [
                    {
                        "type": "array",
                        "items": "File"
                    }
                ],
                "inputBinding": {
                    "position": 1,
                    "separate": true,
                    "itemSeparator": " "
                },
                "id": "#samples_file"
            });

            CommandLineParsers.array(input, {}, [{
                "class": "File",
                "secondaryFiles": [],
                "size": 0,
                "path": "/path/to/file"
            }, {
                "class": "File",
                "secondaryFiles": [],
                "size": 0,
                "path": "/path/to/file2"
            }], {}, "input", "input").then(function (res) {

                expect(res.value).to.equal("/path/to/file /path/to/file2");

            }).then(done, done);
        });
    });

    describe("primitive", () => {
        it("should evaluate a file input without valueFrom", (done) => {
            const input = new SBDraft2CommandInputParameterModel({
                "type": [
                    "null",
                    "File"
                ],
                "inputBinding": {
                    "position": 22,
                    "prefix": "-S",
                    "separate": true
                },
                "id": "#samples_file"
            });

            CommandLineParsers.primitive(input, {}, {
                "class": "File",
                "secondaryFiles": [],
                "size": 0,
                "path": "/path/to/file"
            }, {}, "input", "input").then(function (res) {

                expect(res.value).to.equal("-S /path/to/file");

            }).then(done, done);
        })
    })
});