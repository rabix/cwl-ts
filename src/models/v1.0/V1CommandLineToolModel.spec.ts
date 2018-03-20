import {expect} from "chai";
import {CommandLineTool} from "../../mappings/v1.0/CommandLineTool";
import {testNamespaces} from "../../tests/shared/model";
import {CommandLinePart} from "../helpers/CommandLinePart";
import {ExpressionEvaluator} from "../helpers/ExpressionEvaluator";
import {JSExecutor} from "../helpers/JSExecutor";
import {V1CommandInputParameterModel} from "./V1CommandInputParameterModel";
import {V1CommandLineToolModel} from "./V1CommandLineToolModel";
import {V1CommandOutputParameterModel} from "./V1CommandOutputParameterModel";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {CommandLineParsers} from "../helpers/CommandLineParsers";

function runTest(app: CommandLineTool, job: any, expected: CommandLinePart[], done) {
    let model = new V1CommandLineToolModel(app, "document");
    model.setJobInputs(job);
    model.setRuntime({"cores": 4});
    model.generateCommandLineParts().then((result) => {
        let resStr = result.map(
            (part) => {
                return part.value
            }
        ).filter((part) => {
            return part !== ""
        });

        expect(resStr.join(" ")).to.equals(expected.join(" "));
    }).then(done, done);
}

function makeTests(specPath: string) {
    const YAML    = require("js-yaml");
    const fs      = require("fs");
    const path    = require('path');
    const spec    = fs.readFileSync(specPath);
    let tests     = YAML.safeLoad(spec);
    let testsRoot = path.dirname(specPath);

    for (let test of tests) {
        it("should pass " + test["doc"], (done) => {
            let tool = YAML.safeLoad(fs.readFileSync(path.join(testsRoot, test["tool"])));
            let job  = YAML.safeLoad(fs.readFileSync(path.join(testsRoot, test["job"])));
            runTest(tool, job, test["output"], done);
        });
    }

}

describe("V1CommandLineToolModel", () => {

    testNamespaces(V1CommandLineToolModel);

    describe("generateCommandLineParts conformance", () => {
        const path     = require('path');
        const specPath = path.join(__dirname, '../../../src/tests/cli-conformance/conformance-test-v1.yaml');
        makeTests(specPath);
    });

    describe("generateCommandLineParts", () => {
        it("should evaluate an array of records", (done) => {
            const model = new V1CommandLineToolModel({
                class: "CommandLineTool",
                inputs: [
                    {
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
                    }
                ],
                outputs: []
            });

            model.setJobInputs({
                input: [
                    {f1: "hello", f2: 3},
                    {f1: "world", f2: 4}
                ]
            });

            model.generateCommandLine().then(function(cmd) {
                expect(cmd).to.equal("hello 3 world 4");
            }).then(done, done);
        });

        it("should evaluate a single record", (done) => {
            const model = new V1CommandLineToolModel({
                class: "CommandLineTool",
                inputs: [
                    {
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
                    }
                ],
                outputs: []
            });

            model.setJobInputs({
                input: {f1: "hello", f2: 3},
            });

            model.generateCommandLine().then(function(cmd) {
                expect(cmd).to.equal("hello 3");
            }).then(done, done);
        });

        it("should evaluate valueFrom in input", (done) => {
            const model = new V1CommandLineToolModel(<any> {
                inputs: {
                    first: {
                        type: {
                            type: "enum",
                            symbols: ["First", "Second", "Third"]
                        },
                        inputBinding: {
                            valueFrom: "${ return self.toLowerCase() }"
                        }
                    }
                }
            });

            model.generateCommandLineParts().then(res => {
                expect(res[0].type).to.equal("input");
                expect(res[0].value).to.equal("first");
            }).then(done, done);
        });

        it("should evaluate argument that is an expression", (done) => {
            const model = new V1CommandLineToolModel(<any> {
                arguments: [
                    "${ return 3 + 4 }"
                ]
            });

            model.generateCommandLineParts().then(res => {
                expect(res[0].type).to.equal("argument");
                expect(res[0].value).to.equal("7");
            }).then(done, done);
        });

        it("should show error in command line if argument expression has an error", (done) => {
            const model = new V1CommandLineToolModel(<any> {
                arguments: [
                    "${ return !!!! }"
                ]
            }, "document");

            model.generateCommandLineParts().then(res => {
                expect(res[0].type).to.equal("error");
                expect(res[0].value).to.equal("<error at document.arguments[0]>");
            }).then(done, done);
        });
    });

    describe("serialize", () => {
        let model: V1CommandLineToolModel;

        beforeEach(() => {
            model                                  = new V1CommandLineToolModel(<any> {});
            ExpressionEvaluator.evaluateExpression = JSExecutor.evaluate;
        });

        it("should serialize baseCommand that is defined", () => {
            model.addBaseCommand("grep");
            const serialized = model.serialize();

            expect(serialized.baseCommand).to.have.length(1);
            expect(serialized.baseCommand).to.deep.equal(["grep"]);
        });

        it("should serialize baseCommand that is blank", () => {
            model.addBaseCommand();
            const serialized = model.serialize();

            expect(serialized.baseCommand).to.have.length(0);
            expect(serialized.baseCommand).to.deep.equal([]);
        });

        it("should serialize baseCommand that is an array of strings", () => {
            model = new V1CommandLineToolModel(<any> {baseCommand: ["one", "two"]});
            expect(model.baseCommand).to.deep.equal(["one", "two"]);

            const serialized = model.serialize();

            expect(serialized.baseCommand).to.have.length(2);
            expect(serialized.baseCommand).to.deep.equal(["one", "two"]);
        });

        it("should serialize baseCommand that is a single string as an array of one string", () => {
            model = new V1CommandLineToolModel(<any> {baseCommand: "string"});
            expect(model.baseCommand).to.deep.equal(["string"]);

            const serialized = model.serialize();

            expect(serialized.baseCommand).to.have.length(1);
            expect(serialized.baseCommand).to.deep.equal(["string"]);
        });

        it("should split spaced string into array of strings", () => {
            model = new V1CommandLineToolModel(<any> {baseCommand: "one two"});
            expect(model.baseCommand).to.deep.equal(["one", "two"]);

            const serialized = model.serialize();

            expect(serialized.baseCommand).to.have.length(2);
            expect(serialized.baseCommand).to.deep.equal(["one", "two"]);
        });

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

        it("should change job key when changing a field id", () => {
            const model = new V1CommandLineToolModel(<any> {
                inputs: {
                    input: {
                        type: {
                            type: "record",
                            fields: {
                                field: "string"
                            }
                        }
                    }
                }
            });

            const context = model.getContext();

            expect(context.inputs).to.deep.equal({
                input: {
                    field: "field-string-value"
                }
            });

            model.changeIOId(model.inputs[0].type.fields[0], "newId");

            expect(context.inputs).to.deep.equal({
                input: {
                    newId: "field-string-value"
                }
            });
        });

        it("should change job value when changing a field type", () => {
            const model = new V1CommandLineToolModel(<any> {
                inputs: {
                    input: {
                        type: {
                            type: "record",
                            fields: {
                                field: "string"
                            }
                        }
                    }
                }
            });

            const context = model.getContext();

            expect(context.inputs).to.deep.equal({
                input: {
                    field: "field-string-value"
                }
            });

            model.inputs[0].type.fields[0].type.type = "File";
            expect(context.inputs).to.deep.equal({
                input: {
                    field: {
                        path: "/path/to/field.ext",
                        "class": "File",
                        nameroot: "field",
                        basename: "field.ext",
                        contents: "file contents",
                        nameext: ".ext",
                        size: 0,
                        secondaryFiles: []
                    }
                }
            });
        });

        it("should add mock field to job when adding field", () => {
            const model = new V1CommandLineToolModel(<any> {
                inputs: {
                    input: {
                        type: {
                            type: "record",
                            fields: []
                        }
                    }
                }
            });

            let context = model.getContext();
            expect(context.inputs).to.deep.equal({
                input: {}
            });

            model.inputs[0].type.addField({name: "field", type: "string"});
            expect(context.inputs).to.deep.equal({
                input: {
                    field: "field-string-value"
                }
            });
            expect(context.inputs.input).to.have.all.keys("field");
            expect(typeof context.inputs.input.field).to.equal("string");
        });

        it("should remove field from record value", () => {
            const model = new V1CommandLineToolModel(<any> {
                inputs: {
                    input: {
                        type: {
                            type: "record",
                            fields: {
                                field: "string"
                            }
                        }
                    }
                }
            });

            const context = model.getContext();

            expect(context.inputs).to.deep.equal({
                input: {
                    field: "field-string-value"
                }
            });

            model.inputs[0].type.removeField(model.inputs[0].type.fields[0]);
            expect(context.inputs).to.deep.equal({
                input: {}
            });
        });

        it("should add mock field to job when adding field to record[]", () => {
            const model = new V1CommandLineToolModel(<any> {
                inputs: {
                    input: {
                        type: {
                            type: "array",
                            items: {
                                type: "record",
                                fields: []
                            }
                        }
                    }
                }
            });

            let context = model.getContext();
            expect(context.inputs).to.deep.equal({
                input: [{}, {}]
            });

            model.inputs[0].type.addField({name: "field", type: "string"});
            expect(context.inputs).to.deep.equal({
                input: [{
                    field: "field-string-value"
                }, {
                    field: "field-string-value"
                }]
            });
        });

        it("should change job key when changing field id in record[]", () => {
            const model = new V1CommandLineToolModel(<any> {
                inputs: {
                    input: {
                        type: {
                            type: "array",
                            items: {
                                type: "record",
                                fields: [
                                    {
                                        type: "string",
                                        name: "field"
                                    }
                                ]
                            }
                        }
                    }
                }
            });

            let context = model.getContext();
            expect(context.inputs).to.deep.equal({
                input: [{
                    field: "field-string-value"
                }, {
                    field: "field-string-value"
                }]
            });

            model.changeIOId(model.inputs[0].type.fields[0], "newId");

            expect(context.inputs).to.deep.equal({
                input: [{
                    newId: "field-string-value"
                }, {
                    newId: "field-string-value"
                }]
            });
        });

        it("should remove field from record[] value", () => {
            const model = new V1CommandLineToolModel(<any> {
                inputs: {
                    input: {
                        type: {
                            type: "array",
                            items: {
                                type: "record",
                                fields: [
                                    {
                                        type: "string",
                                        name: "field"
                                    }
                                ]
                            }
                        }
                    }
                }
            });

            let context = model.getContext();
            expect(context.inputs).to.deep.equal({
                input: [{
                    field: "field-string-value"
                }, {
                    field: "field-string-value"
                }]
            });

            model.inputs[0].type.removeField(model.inputs[0].type.fields[0]);
            expect(context.inputs).to.deep.equal({
                input: [{}, {}]
            });
        });

        it("should change value of field in record[] when changing type", () => {
            const model = new V1CommandLineToolModel(<any> {
                inputs: {
                    input: {
                        type: {
                            type: "array",
                            items: {
                                type: "record",
                                fields: [
                                    {
                                        type: "string",
                                        name: "field"
                                    }
                                ]
                            }
                        }
                    }
                }
            });

            let context = model.getContext();
            expect(context.inputs).to.deep.equal({
                input: [{
                    field: "field-string-value"
                }, {
                    field: "field-string-value"
                }]
            });

            model.inputs[0].type.fields[0].type.type = "boolean";
            expect(context.inputs).to.deep.equal({
                input: [{field: true}, {field: true}]
            });
        });

        it("should add mock value for nested record in record[]", () => {
            const model = new V1CommandLineToolModel(<any> {
                inputs: {
                    input: {
                        type: {
                            type: "array",
                            items: {
                                type: "record",
                                fields: [
                                    {name: "field", type: {type: "record", fields: []}}
                                ]
                            }
                        }
                    }
                }
            });

            let context = model.getContext();
            expect(context.inputs).to.deep.equal({
                input: [{
                    field: {}
                }, {
                    field: {}
                }]
            });

            model.inputs[0].type.fields[0].type.addField({name: "nested", type: "string"});
            expect(context.inputs).to.deep.equal({
                input: [
                    {
                        field: {
                            nested: "nested-string-value"
                        }
                    },
                    {
                        field: {
                            nested: "nested-string-value"
                        }
                    }
                ]
            });
        });

        it("should remove nested field in record[]", () => {
            const model = new V1CommandLineToolModel(<any> {
                inputs: {
                    input: {
                        type: {
                            type: "array",
                            items: {
                                type: "record",
                                fields: [
                                    {
                                        name: "field",
                                        type: {
                                            type: "record", fields: [
                                                {name: "nested", type: "string"}
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            });

            let context = model.getContext();
            expect(context.inputs).to.deep.equal({
                input: [
                    {
                        field: {
                            nested: "nested-string-value"
                        }
                    },
                    {
                        field: {
                            nested: "nested-string-value"
                        }
                    }
                ]
            });

            model.inputs[0].type.fields[0].type.removeField(model.inputs[0].type.fields[0].type.fields[0]);
            expect(context.inputs).to.deep.equal({
                input: [
                    {
                        field: {}
                    },
                    {
                        field: {}
                    }
                ]
            });
        });

        it("should change type for nested record in record[]", () => {
            const model = new V1CommandLineToolModel(<any> {
                inputs: {
                    input: {
                        type: {
                            type: "array",
                            items: {
                                type: "record",
                                fields: [
                                    {
                                        name: "field",
                                        type: {
                                            type: "record", fields: [
                                                {name: "nested", type: "string"}
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            });

            let context = model.getContext();
            expect(context.inputs).to.deep.equal({
                input: [
                    {
                        field: {
                            nested: "nested-string-value"
                        }
                    },
                    {
                        field: {
                            nested: "nested-string-value"
                        }
                    }
                ]
            });

            model.inputs[0].type.fields[0].type.fields[0].type.type = "boolean";
            expect(context.inputs).to.deep.equal({
                input: [
                    {
                        field: {
                            nested: true
                        }
                    },
                    {
                        field: {
                            nested: true
                        }
                    }
                ]
            });
        });

        it("should create mock value for nested record[] in record[]", () => {
            const model = new V1CommandLineToolModel(<any> {
                "inputs": [
                    {
                        "id": "parent",
                        "type": [
                            "null",
                            {
                                "type": "array",
                                "items": {
                                    "type": "record",
                                    "fields": [
                                        {
                                            "name": "child",
                                            "type": [
                                                "null",
                                                {
                                                    "type": "array",
                                                    "items": {
                                                        "type": "record",
                                                        "fields": [
                                                            {
                                                                "name": "grand-child",
                                                                "type": [
                                                                    "null",
                                                                    {
                                                                        "type": "record",
                                                                        "fields": [
                                                                            {
                                                                                "name": "great-grand-child",
                                                                                "type": "string?",
                                                                                "inputBinding": {
                                                                                    "position": 0
                                                                                }
                                                                            }
                                                                        ],
                                                                        "name": "grand-child"
                                                                    }
                                                                ],
                                                                "inputBinding": {
                                                                    "position": 0
                                                                }
                                                            }
                                                        ]
                                                    }
                                                }
                                            ],
                                            "inputBinding": {
                                                "position": 0
                                            }
                                        }
                                    ]
                                }
                            }
                        ],
                        "inputBinding": {
                            "position": 0
                        },
                        "secondaryFiles": []
                    }
                ]
            });

            let context = model.getContext();
            expect(context.inputs).to.deep.equal({
                parent: [
                    {
                        child: [
                            {
                                "grand-child": {
                                    "great-grand-child": "great-grand-child-string-value"
                                }
                            },
                            {
                                "grand-child": {
                                    "great-grand-child": "great-grand-child-string-value"
                                }
                            }
                        ]
                    },
                    {
                        child: [
                            {
                                "grand-child": {
                                    "great-grand-child": "great-grand-child-string-value"
                                }
                            },
                            {
                                "grand-child": {
                                    "great-grand-child": "great-grand-child-string-value"
                                }
                            }
                        ]
                    }
                ]
            });
        });

        it("should change id for nested record[] in record[]", () => {
            const model = new V1CommandLineToolModel(<any> {
                "inputs": [
                    {
                        "id": "parent",
                        "type": [
                            "null",
                            {
                                "type": "array",
                                "items": {
                                    "type": "record",
                                    "fields": [
                                        {
                                            "name": "child",
                                            "type": [
                                                "null",
                                                {
                                                    "type": "array",
                                                    "items": {
                                                        "type": "record",
                                                        "fields": [
                                                            {
                                                                "name": "grand-child",
                                                                "type": [
                                                                    "null",
                                                                    {
                                                                        "type": "record",
                                                                        "fields": [
                                                                            {
                                                                                "name": "great-grand-child",
                                                                                "type": "string?",
                                                                                "inputBinding": {
                                                                                    "position": 0
                                                                                }
                                                                            }
                                                                        ],
                                                                        "name": "grand-child"
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            });

            let context = model.getContext();
            expect(context.inputs).to.deep.equal({
                parent: [
                    {
                        child: [
                            {
                                "grand-child": {
                                    "great-grand-child": "great-grand-child-string-value"
                                }
                            },
                            {
                                "grand-child": {
                                    "great-grand-child": "great-grand-child-string-value"
                                }
                            }
                        ]
                    },
                    {
                        child: [
                            {
                                "grand-child": {
                                    "great-grand-child": "great-grand-child-string-value"
                                }
                            },
                            {
                                "grand-child": {
                                    "great-grand-child": "great-grand-child-string-value"
                                }
                            }
                        ]
                    }
                ]
            });

            model.changeIOId(model.inputs[0].type.fields[0].type.fields[0].type.fields[0], "nestedRecArr");

            expect(context.inputs).to.deep.equal({
                parent: [
                    {
                        child: [
                            {
                                "grand-child": {
                                    nestedRecArr: "great-grand-child-string-value"
                                }
                            },
                            {
                                "grand-child": {
                                    nestedRecArr: "great-grand-child-string-value"
                                }
                            }
                        ]
                    },
                    {
                        child: [
                            {
                                "grand-child": {
                                    nestedRecArr: "great-grand-child-string-value"
                                }
                            },
                            {
                                "grand-child": {
                                    nestedRecArr: "great-grand-child-string-value"
                                }
                            }
                        ]
                    }
                ]
            });
        });

        it("should change type for nested record[] in record[]", () => {
            const model = new V1CommandLineToolModel(<any> {
                "inputs": [
                    {
                        "id": "parent",
                        "type": [
                            "null",
                            {
                                "type": "array",
                                "items": {
                                    "type": "record",
                                    "fields": [
                                        {
                                            "name": "child",
                                            "type": [
                                                "null",
                                                {
                                                    "type": "array",
                                                    "items": {
                                                        "type": "record",
                                                        "fields": [
                                                            {
                                                                "name": "grand-child",
                                                                "type": [
                                                                    "null",
                                                                    {
                                                                        "type": "record",
                                                                        "fields": [
                                                                            {
                                                                                "name": "great-grand-child",
                                                                                "type": "string?",
                                                                                "inputBinding": {
                                                                                    "position": 0
                                                                                }
                                                                            }
                                                                        ],
                                                                        "name": "grand-child"
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            });

            let context = model.getContext();
            expect(context.inputs).to.deep.equal({
                parent: [
                    {
                        child: [
                            {
                                "grand-child": {
                                    "great-grand-child": "great-grand-child-string-value"
                                }
                            },
                            {
                                "grand-child": {
                                    "great-grand-child": "great-grand-child-string-value"
                                }
                            }
                        ]
                    },
                    {
                        child: [
                            {
                                "grand-child": {
                                    "great-grand-child": "great-grand-child-string-value"
                                }
                            },
                            {
                                "grand-child": {
                                    "great-grand-child": "great-grand-child-string-value"
                                }
                            }
                        ]
                    }
                ]
            });

            model.inputs[0].type.fields[0].type.fields[0].type.fields[0].type.type = "boolean";
            expect(context.inputs).to.deep.equal({
                parent: [
                    {
                        child: [
                            {
                                "grand-child": {
                                    "great-grand-child": true
                                }
                            },
                            {
                                "grand-child": {
                                    "great-grand-child": true
                                }
                            }
                        ]
                    },
                    {
                        child: [
                            {
                                "grand-child": {
                                    "great-grand-child": true
                                }
                            },
                            {
                                "grand-child": {
                                    "great-grand-child": true
                                }
                            }
                        ]
                    }
                ]
            });
        });

    });

    describe("ShellCommandRequirement", () => {
        it("should add ShellCommandRequirement if an argument has shellQuote: false", () => {
            const tool = new V1CommandLineToolModel(<any> {
                arguments: [
                    {
                        prefix: "b",
                        valueFrom: "string",
                        shellQuote: false
                    }
                ]
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("ShellCommandRequirement");
        });

        it("should add ShellCommandRequirement if an input has shellQuote: false", () => {
            const tool = new V1CommandLineToolModel(<any> {
                inputs: {
                    first: {
                        type: "string",
                        inputBinding: {
                            prefix: "a",
                            shellQuote: false
                        }
                    }
                }
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("ShellCommandRequirement");
        });

        it("should add ShellCommandRequirement if field has shellQuote: false", () => {
            const tool = new V1CommandLineToolModel(<any> {
                inputs: {
                    first: {
                        type: {
                            type: "record",
                            fields: {
                                field: {
                                    type: "string",
                                    inputBinding: {
                                        shellQuote: false
                                    }
                                }
                            }
                        },
                        inputBinding: {
                            prefix: "a"
                        }
                    }
                }
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("ShellCommandRequirement");
        });

        it("should not add ShellQuoteRequirement if no binding has shellQuote: false", () => {
            const tool = new V1CommandLineToolModel(<any> {
                inputs: {
                    first: "string",
                    second: {
                        type: "string",
                        inputBinding: {
                            prefix: "a"
                        }
                    }
                },
                arguments: [
                    {
                        prefix: "b",
                        valueFrom: "string"
                    }
                ]
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.exist;
        });

        it("should remove ShellQuoteRequirement if no binding has shellQuote: false", () => {
            const tool = new V1CommandLineToolModel(<any> {
                inputs: {
                    first: "string",
                    second: {
                        type: "string",
                        inputBinding: {
                            prefix: "a"
                        }
                    }
                },
                arguments: [
                    {
                        prefix: "b",
                        valueFrom: "string"
                    }
                ],
                requirements: [
                    {
                        class: "ShellCommandRequirement"
                    }
                ]
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.exist;
        });

        it("should not duplicate requirement", () => {
            const tool = new V1CommandLineToolModel(<any> {
                arguments: [{
                    shellQuote: false
                }],
                requirements: [{
                    "class": "ShellCommandRequirement"
                }]
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("ShellCommandRequirement");
        });

    });

    describe("InlineJavascriptRequirement", () => {
        it("should add requirement if input.inputBinding.valueFrom is expression", () => {
            const tool = new V1CommandLineToolModel(<any> {
                inputs: {
                    one: {
                        inputBinding: {
                            valueFrom: "$(expr)"
                        }
                    }
                }
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("InlineJavascriptRequirement");
        });

        it("should add requirement if input.secondaryFile is expression", () => {
            const tool = new V1CommandLineToolModel(<any> {
                inputs: {
                    one: {
                        type: "File",
                        secondaryFiles: ["$(expr)"]
                    }
                }
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("InlineJavascriptRequirement");
        });

        it("should add requirement if output.outputBinding.glob is expression", () => {
            const tool = new V1CommandLineToolModel(<any> {
                outputs: {
                    one: {
                        outputBinding: {glob: "$(expr)"}
                    }
                }
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("InlineJavascriptRequirement");
        });

        it("should add requirement if output.outputBinding.outputEval is expression", () => {
            const tool = new V1CommandLineToolModel(<any> {
                outputs: {
                    one: {
                        outputBinding: {outputEval: "$(expr)"}
                    }
                }
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("InlineJavascriptRequirement");
        });

        it("should add requirement if output.secondaryFile is expression", () => {
            const tool = new V1CommandLineToolModel(<any> {
                outputs: {
                    one: {
                        type: "File",
                        secondaryFiles: ["$(expr)"]
                    }
                }
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("InlineJavascriptRequirement");
        });

        it("should add requirement if stdin is expression", () => {
            const tool = new V1CommandLineToolModel(<any> {
                stdin: "$(expr)"
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("InlineJavascriptRequirement");
        });

        it("should add requirement if stdout is expression", () => {
            const tool = new V1CommandLineToolModel(<any> {
                stdout: "$(expr)"
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("InlineJavascriptRequirement");
        });

        it("should add requirement if stderr is expression", () => {
            const tool = new V1CommandLineToolModel(<any> {
                stderr: "$(expr)"
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("InlineJavascriptRequirement");
        });

        it("should add requirement if argument.valueFrom is expression", () => {
            const tool = new V1CommandLineToolModel(<any> {
                arguments: [
                    {
                        valueFrom: "$(expr)"
                    }
                ]
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("InlineJavascriptRequirement");
        });

        it("should add requirement if argument is expression", () => {
            const tool = new V1CommandLineToolModel(<any> {
                arguments: ["$(expr)"]
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("InlineJavascriptRequirement");
        });

        it("should add requirement if fileRequirement has expression", () => {
            const tool = new V1CommandLineToolModel(<any> {
                requirements: [
                    {
                        "class": "InitialWorkDirRequirement",
                        listing: [
                            {entryname: "$(name)", entry: "content"}
                        ]
                    }
                ]
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(2);
            expect(serialize.requirements[1].class).to.equal("InlineJavascriptRequirement");
        });

        it("should add requirement if resourceRequirement has expression", () => {
            const tool = new V1CommandLineToolModel(<any> {
                requirements: [
                    {
                        "class": "ResourceRequirement",
                        ramMin: "$(expr)"
                    }
                ]
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(2);
            expect(serialize.requirements[1].class).to.equal("InlineJavascriptRequirement");
        });

        it("should not remove existing requirement", () => {
            const tool = new V1CommandLineToolModel(<any> {
                requirements: [{
                    "class": "InlineJavascriptRequirement"
                }]
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("InlineJavascriptRequirement");
        });

        it("should not duplicate requirement", () => {
            const tool = new V1CommandLineToolModel(<any> {
                stdin: "$(expr)",
                requirements: [{
                    "class": "InlineJavascriptRequirement"
                }]
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("InlineJavascriptRequirement");
        });
    });

    describe("SBG inherit metadata", () => {
        let model: V1CommandLineToolModel;
        let output: V1CommandOutputParameterModel;
        let outputWithInherit: V1CommandOutputParameterModel;
        let input: V1CommandInputParameterModel;

        beforeEach(() => {
            ExpressionEvaluator.evaluateExpression = JSExecutor.evaluate;
            model                                  = new V1CommandLineToolModel({
                inputs: {
                    input: "File",
                    input2: "File"
                },
                outputs: {
                    output: "File",
                    output2: {
                        type: "File",
                        outputBinding: {
                            outputEval: "$(inheritMetadata(self, inputs.input))"
                        }
                    }
                }
            } as any);

            output            = model.outputs[0];
            input             = model.inputs[0];
            outputWithInherit = model.outputs[1];
        });

        it("should add sbg expression lib if inherit metadata is set on an output", () => {
            output.outputBinding.setInheritMetadataFrom("input");

            const serialized = model.serialize();
            expect(serialized.requirements).to.have.lengthOf(1);
            expect(serialized.requirements[0]).to.haveOwnProperty("expressionLib");
            expect(serialized.requirements[0].class).to.equal("InlineJavascriptRequirement");
            expect((serialized.requirements[0] as any).expressionLib).to.have.lengthOf(1);
            expect(typeof (serialized.requirements[0] as any).expressionLib[0]).to.equal("string")
        });

        it("should set outputEval if inherit metadata is set on an output", () => {
            output.outputBinding.setInheritMetadataFrom("input");

            const serialized = model.serialize();
            expect(serialized.outputs[0].outputBinding.outputEval).to.not.be.empty;
            expect(serialized.outputs[0].outputBinding.outputEval).to.equal("$(inheritMetadata(self, inputs.input))");
        });

        it("should add to outputEval if it is already set", () => {
            const expr                      = "${ return 4 + 3}";
            output.outputBinding.outputEval = new V1ExpressionModel(expr);
            output.outputBinding.setInheritMetadataFrom("input");

            const serialized = model.serialize();
            expect(serialized.outputs[0].outputBinding.outputEval).to.not.be.empty;
            expect(serialized.outputs[0].outputBinding.outputEval).to.equal(expr + "\n\n$(inheritMetadata(self, inputs.input))");
        });

        it("should change outputEval if inherit metadata is changed", () => {
            output.outputBinding.setInheritMetadataFrom("input");
            output.outputBinding.setInheritMetadataFrom("input2");

            const serialized = model.serialize();
            expect(serialized.outputs[0].outputBinding.outputEval).to.not.be.empty;
            expect(serialized.outputs[0].outputBinding.outputEval).to.equal("$(inheritMetadata(self, inputs.input2))");
        });

        it("should populate inheritMetadataFrom field if outputEval had inherit script", () => {
            expect(outputWithInherit.outputBinding.inheritMetadataFrom).to.equal("input");
        });

        it("should remove sbg expression lib if no outputEval has inherit script, but leave requirement if expressions exist", () => {
            output.outputBinding.setInheritMetadataFrom("input");
            output.outputBinding.setInheritMetadataFrom(null);
            outputWithInherit.outputBinding.setInheritMetadataFrom(null);

            const expr                      = "${ return 4 + 3}";
            output.outputBinding.outputEval = new V1ExpressionModel(expr);

            const serialized = model.serialize();
            expect(serialized.requirements).to.not.be.empty;
            expect(serialized.requirements[0].class).to.equal("InlineJavascriptRequirement");
            expect(serialized.requirements[0]).to.not.haveOwnProperty("expressionLib");
        });

        it("should remove outputEval inherit script if inherit metadata is removed", () => {
            output.outputBinding.setInheritMetadataFrom("input");
            output.outputBinding.setInheritMetadataFrom(null);

            const serialized = model.serialize();
            expect(serialized.outputs[0].outputBinding.outputEval).to.be.undefined;
        });

        it("should remove only inherit script from outputEval if inherit is removed", () => {

        });
    });

    describe("validation", () => {
        beforeEach(() => {
            ExpressionEvaluator.evaluateExpression = JSExecutor.evaluate;
        });

        it("should be invalid if inputs have duplicate id", (done) => {
            const model = new V1CommandLineToolModel(<any> {
                inputs: [
                    {id: "dup", type: "string"},
                    {id: "dup", type: "int"}
                ]
            });

            model.validate().then(() => {
                const errors = model.filterIssues();
                expect(errors).to.not.be.empty;
                expect(errors).to.have.length(1);
                expect(errors[0].loc).to.equal("document.inputs[1].id");
            }).then(done, done);
        });

        it("should be invalid if outputs have duplicate id", (done) => {
            const model = new V1CommandLineToolModel(<any> {
                outputs: [
                    {id: "dup", type: "string"},
                    {id: "dup", type: "int"}
                ]
            });

            model.validate().then(() => {
                const errors = model.errors;
                expect(errors).to.not.be.empty;
                expect(errors).to.have.length(1);
                expect(errors[0].loc).to.equal("document.outputs[1].id");
            }).then(done, done);
        });

        it("should be invalid if stdin expression is invalid", (done) => {
            const model = new V1CommandLineToolModel(<any> {
                stdin: "${!!!}"
            });

            model.validate().then(() => {
                const errors = model.errors;
                expect(errors).to.not.be.empty;
                expect(errors).to.have.length(1);
                expect(errors[0].loc).to.equal("document.stdin");

                expect(model.stdin.errors).to.not.be.empty;
                expect(model.stdin.errors).to.have.length(1);
                expect(model.stdin.errors[0].loc).to.equal("document.stdin");
            }).then(done, done);
        });

        it("should be invalid if stdout expression is invalid", (done) => {
            const model = new V1CommandLineToolModel(<any> {
                stdout: "${!!!}"
            });

            model.validate().then(() => {
                expect(model.errors).to.not.be.empty;
                expect(model.errors).to.have.length(1);
                expect(model.errors[0].loc).to.equal("document.stdout");
            }).then(done, done);

        });

        it("should be invalid if stdout expression is changed to invalid", (done) => {
            const model = new V1CommandLineToolModel(<any> {
                stdout: "${return 3}"
            });

            model.stdout.setValue("${!!!}");

            model.validate().then(() => {
                expect(model.errors).to.not.be.empty;
                expect(model.errors).to.have.length(1);
                expect(model.errors[0].loc).to.equal("document.stdout");
            }).then(done, done);
        });

        it("should be valid if valueFrom is valid", (done) => {
            const model = new V1CommandLineToolModel(<any> {
                inputs: [
                    {
                        id: "input1",
                        inputBinding: {
                            valueFrom: "${return 3}"
                        }
                    }
                ]
            });
            model.validate().then(() => {
                expect(model.errors).to.be.empty;
                expect(model.inputs[0].errors).to.be.empty;
            }).then(done, done);
        });

        it("should be invalid if valueFrom is invalid", (done) => {
            const model = new V1CommandLineToolModel(<any> {
                inputs: [
                    {
                        id: "input1",
                        inputBinding: {
                            valueFrom: "${!!!}"
                        }
                    }
                ]
            });


            model.validate().then(() => {
                expect(model.errors).to.not.be.empty;
                expect(model.errors).to.have.length(1);
                expect(model.errors[0].loc).to.equal("document.inputs[0].inputBinding.valueFrom");
            }).then(done, done);
        });

        it("should be invalid if valueFrom is changed to invalid", (done) => {
            const model = new V1CommandLineToolModel(<any> {
                inputs: [
                    {
                        id: "input1",
                        inputBinding: {
                            valueFrom: "${return 3}"
                        }
                    }
                ]
            });

            model.inputs[0].inputBinding.setValueFrom("${!!!!}");

            model.validate().then(() => {
                expect(model.errors).to.not.be.empty;
                expect(model.errors).to.have.length(1);
                expect(model.errors[0].loc).to.equal("document.inputs[0].inputBinding.valueFrom");
            }).then(done, done);
        });

        it("should be invalid if job changes", (done) => {
            const model = new V1CommandLineToolModel(<any> {
                inputs: [
                    {
                        id: "input1",
                        type: "string",
                        inputBinding: {
                            valueFrom: "${inputs.input1.length}"
                        }
                    }
                ]
            });

            model.setJobInputs({
                input1: "string-value"
            });

            model.validate().then(() => {
                expect(model.warnings).to.be.empty;
            }).then(done, done);
        });

        it("should validate valueFrom in a record", (done) => {
            const model = new V1CommandLineToolModel(<any> {
                "inputs": [
                    {
                        "id": "input",
                        "type": {
                            "type": "record",
                            "fields": [
                                {
                                    "name": "input_field",
                                    "type": "string?",
                                    "inputBinding": {
                                        "position": 0,
                                        "valueFrom": "$(self.length)"
                                    }
                                }
                            ],
                            "name": "input"
                        },
                        "inputBinding": {
                            "position": 0
                        }
                    }
                ]
            });

            model.setJobInputs({
                input: {
                    input_field: "string-value"
                }
            });

            model.validate().then(() => {
                expect(model.warnings).to.be.empty;
            }).then(done, done);
        });
    });
});
