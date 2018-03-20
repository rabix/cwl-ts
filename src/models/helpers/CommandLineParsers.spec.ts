import {expect} from "chai";
import {CommandLineParsers} from "./CommandLineParsers";
import {SBDraft2ExpressionModel} from "../d2sb/SBDraft2ExpressionModel";
import {SBDraft2CommandInputParameterModel} from "../d2sb/SBDraft2CommandInputParameterModel";
import {V1CommandInputParameterModel} from "../v1.0";

describe("CommandLineParsers", () => {
    describe("streams", () => {

        it("should show a warning if stdout expression is invalid", (done) => {
            const stdout = new SBDraft2ExpressionModel({
                script: "job",
                engine: "",
                "class": "Expression"
            }, "");

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

        it("should evaluate an array of records", (done) => {
            const input = new V1CommandInputParameterModel({
                type: {
                    type: "array",
                    items: {
                        type: "record",
                        fields: [
                            {
                                name: "f1",
                                type: "string",
                                inputBinding: {}
                            },
                            {
                                name: "f2",
                                type: "int",
                                inputBinding: {}
                            }
                        ]
                    }
                },
                id: "input",
                inputBinding: {}
            });

            CommandLineParsers.array(input, {}, [
                {f1: "hello", f2: 3},
                {f1: "world", f2: 4}
            ], {}, "input", "input").then(function (res) {
                expect(res.value).to.equal("hello 3 world 4");
            }).then(done, done);
        });

        it("should evaluate a single record", (done) => {
            const input = new V1CommandInputParameterModel({
                type: {
                    type: "record",
                    fields: [
                        {
                            name: "f1",
                            type: "string",
                            inputBinding: {}
                        },
                        {
                            name: "f2",
                            type: "int",
                            inputBinding: {}
                        }
                    ]
                },
                id: "input",
                inputBinding: {}
            });

            CommandLineParsers.record(input, {}, {f1: "hello", f2: 3}, {}, "input", "input").then(function (res) {
                expect(res.value).to.equal("hello 3");
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
        });

        it("should not exclude Int(0) from command line", done => {
             const input = new SBDraft2CommandInputParameterModel({
                 id: "#sample_int",
                 type: "int",
                 inputBinding: {}
             });

             CommandLineParsers.primitive(input, {}, 0, {}, "input", "input")
                 .then(function(part) {
                     expect(part.value).to.equal("0")
                 })
                 .then(done, done);
        });
    });
});