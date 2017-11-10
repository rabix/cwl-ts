import {SBDraft2CommandInputParameterModel} from "./SBDraft2CommandInputParameterModel";
import {expect} from "chai";
import {CommandInputParameter} from "../../mappings/d2sb/CommandInputParameter";
import {ExpressionClass} from "../../mappings/d2sb/Expression";
import {JSExecutor} from "../helpers/JSExecutor";
import {ExpressionEvaluator} from "../helpers/ExpressionEvaluator";

describe("SBDraft2CommandInputParameterModel d2sb", () => {
    beforeEach(() => {
        ExpressionEvaluator.evaluateExpression = JSExecutor.evaluate;
    });

    describe("constructor", () => {
        it("should create new input from no parameters", () => {
            const input = new SBDraft2CommandInputParameterModel();

            expect(input).to.not.be.undefined;
        });

        it("should create new input from object", () => {
            const input = new SBDraft2CommandInputParameterModel({
                id: "d",
                type: "string"
            });

            expect(input).to.not.be.undefined;
        });
    });

    describe("fields", () => {
        // add field
        it("should add a field as object literal to an input type record", () => {
            const input = new SBDraft2CommandInputParameterModel({
                id: "baz",
                type: {
                    type: "record",
                    fields: []
                }
            });

            input.type.addField({
                name: "field",
                type: "string"
            });

            expect(input.type.fields).to.have.length(1);
        });

        // add field on non record input
        it("should not add a field to an input type not record", () => {
            const input = new SBDraft2CommandInputParameterModel({
                id: "baz",
                type: {
                    type: "array",
                    items: "string"
                }
            });

            expect(() => {
                input.type.addField({
                    name: "field",
                    type: "string"
                });
            }).to.throw;
            expect(input.type.fields).to.be.null;
        });

        // remove field
        it("should remove an existing field by name", () => {
            const input = new SBDraft2CommandInputParameterModel({
                id: "baz",
                type: {
                    type: "record",
                    fields: []
                }
            });

            input.type.addField({
                name: "field",
                type: "string"
            });

            expect(input.type.fields).to.have.length(1);
            input.type.removeField("field");
            expect(input.type.fields).to.have.length(0);
        });

        it("should remove an existing field by object", () => {
            const input = new SBDraft2CommandInputParameterModel({
                id: "baz",
                type: {
                    type: "record",
                    fields: []
                }
            });

            const field = new SBDraft2CommandInputParameterModel({
                name: "field",
                type: "string"
            });

            input.type.addField(field);

            expect(input.type.fields).to.have.length(1);
            input.type.removeField(field);
            expect(input.type.fields).to.have.length(0);
        });

        // add field with duplicate name
        it("should not add field if name already exists", () => {
            const input = new SBDraft2CommandInputParameterModel({
                id: "baz",
                type: {
                    type: "record",
                    fields: []
                }
            });

            input.type.addField({
                name: "field",
                type: "string"
            });

            expect(() => {
                input.type.addField({
                    name: "field",
                    type: "string"
                });
            }).to.throw;
        });

        // removing invalid field
        it("should throw exception when removing nonexistent field", () => {
            const input = new SBDraft2CommandInputParameterModel({
                id: "baz",
                type: {
                    type: "record",
                    fields: []
                }
            });

            input.type.addField({
                name: "field",
                type: "string"
            });

            expect(input.type.fields).to.have.length(1);
            expect(() => {
                input.type.removeField("boo");
            }).to.throw;
        });
    });

    describe("type", () => {
        // set type
        it("should set type by string", () => {
            const input = new SBDraft2CommandInputParameterModel();

            input.type.type = "string";
            expect(input.type.type).to.equal("string");
        });

    });

    describe("isNullable", () => {
        it("should be false if input is required", () => {
            const input = new SBDraft2CommandInputParameterModel({
                id: "a",
                type: {type: "array", items: "int"}
            });

            console.log(input.type);

            expect(input.type.isNullable).to.be.false;
        });

        it("should be true if input is not required", () => {
            const input = new SBDraft2CommandInputParameterModel({
                id: "a",
                type: [{type: "array", items: "int"}, "null"]
            });

            expect(input.type.isNullable).to.be.true;
        });
    });

    describe("items", () => {
        // set items type
        it("should set items for array type", () => {
            const input = new SBDraft2CommandInputParameterModel({
                id: "a",
                type: {type: "array", items: "int"}
            });

            input.type.items = "string";
            expect(input.type.items).to.equal("string");
        });

        // set items type on non-array
        it("should not set items for type that's not array", () => {
            const input = new SBDraft2CommandInputParameterModel({
                id: "a",
                type: {type: "record", fields: []}
            });

            expect(() => {
                input.type.items = "string";
            }).to.throw;
        });
    });

    describe("setValueFrom", () => {
        it("Should set the valueFrom property in the inputBinding", () => {
            const input = new SBDraft2CommandInputParameterModel({
                id: "a",
                type: {type: "array", items: "int"}
            });

            input.createInputBinding();
            input.inputBinding.setValueFrom("asd 123");

            expect(input.inputBinding.valueFrom.toString()).to.equal("asd 123");
        });
    });

    describe("hasInputBinding", () => {

        it("Should return true if there is a an inputBinding", () => {
            const input = new SBDraft2CommandInputParameterModel({
                id: "a",
                type: {type: "array", items: "int"}
            });

            input.createInputBinding();
            input.inputBinding.setValueFrom("asd 123");
            expect(input.isBound).to.equal(true);
        });

        it("Should return false if there is no inputBinding", () => {
            const input = new SBDraft2CommandInputParameterModel({
                id: "a",
                type: {type: "array", items: "int"}
            });

            expect(input.isBound).to.equal(false);
        });
    });

    describe("removeInputBinding", () => {
        beforeEach(() => {
            ExpressionEvaluator.evaluateExpression = JSExecutor.evaluate;
        });

        it("Should remove the inputBinding property", () => {
            const input = new SBDraft2CommandInputParameterModel({
                id: "a",
                type: {type: "array", items: "int"}
            });

            input.createInputBinding();
            input.inputBinding.setValueFrom("asd 123");
            expect(input.isBound).to.equal(true);

            input.removeInputBinding();
            expect(input.isBound).to.equal(false);
        });

        it("Should reset validity of input", (done) => {
            const input = new SBDraft2CommandInputParameterModel({
                id: "input",
                type: "string",
                inputBinding: {
                    valueFrom: {
                        "class": "Expression",
                        engine: "#cwl-js-engine",
                        script: "---"
                    }
                }
            }, "input");

            input.validate({}).then(() => {
                expect(input.errors).to.not.be.empty;
                expect(input.errors[0].loc).to.contain("input.inputBinding.valueFrom");

                input.removeInputBinding();

                input.validate(<any> {}).then(() => {
                    expect(input.errors).to.be.empty;
                }).then(done, done);

            }).then(() => {}, done);
        });

    });

    describe("validate", () => {
        it("Should check if ID exists", (done) => {
            const input = new SBDraft2CommandInputParameterModel({
                type: "string",
                id: ''
            });

            input.validate({}).then(() => {
                const issues = input.filterIssues("error");
                expect(issues).to.not.be.empty;
                expect(issues[0].message).to.equal("ID must be set");
            }).then(done, done);
        });

        it("Should check for invalid characters in ID", () => {
            const input = new SBDraft2CommandInputParameterModel(<CommandInputParameter>{
                type: "string",
                id: "@^%%^"
            });

            expect(input.errors).to.not.be.empty;
            expect(input.errors[0].message).to.contain("invalid characters");
        });

        it("Should ensure enum has symbols", (done) => {
            const input = new SBDraft2CommandInputParameterModel(<CommandInputParameter>{
                id: "asdf",
                type: {
                    type: "enum"
                }
            }, "inp");

            input.validate({}).then(res => {
                const issues = input.filterIssues("error");
                expect(issues).to.not.be.empty;
                expect(issues[0].loc).to.contain("inp.type");
            }).then(done, done);
        });

        it("Should be invalid if valueFrom is invalid", (done) => {
            const input = new SBDraft2CommandInputParameterModel({
                id: "input",
                type: "string",
                inputBinding: {
                    valueFrom: {
                        "class": "Expression",
                        engine: "#cwl-js-engine",
                        script: "---"
                    }
                }
            }, "input");

            input.validate(<any> {}).then(() => {
                expect(input.inputBinding.valueFrom.errors).to.not.be.empty;
                expect(input.inputBinding.errors).to.not.be.empty;
                expect(input.errors).to.not.be.empty;
                expect(input.errors[0].message).to.contain("Unexpected");
            }).then(done, done);
        });
    });

    describe("serialize", () => {
        it("Should serialize simple type, label, description, inputBinding", () => {
            const data  = {
                type: ["string"],
                label: "label",
                description: "desc",
                id: "#hello",
                inputBinding: {
                    position: 0,
                    prefix: "--prefix"
                }
            };
            const input = new SBDraft2CommandInputParameterModel(<CommandInputParameter>data);
            expect(input.serialize()).to.deep.equal(data);
        });

        it("Should serialize complex type, inputBinding with expression", () => {
            const data  = {
                type: [{
                    type: "array",
                    items: "string"
                }],
                id: "#hello",
                inputBinding: {
                    prefix: "--prefix",
                    position: 0,
                    valueFrom: {
                        'class': <ExpressionClass> "Expression",
                        engine: "#cwl-js-engine",
                        script: "{ return 3 + 3 + 3 }"
                    }
                }
            };
            const input = new SBDraft2CommandInputParameterModel(data);
            expect(input.serialize()).to.deep.equal(data);
        });

        it("Should serialize record type with fields", () => {
            const data  = {
                type: [{
                    type: "record",
                    name: "rec",
                    fields: [
                        {
                            type: ["string"],
                            name: "#a",
                            label: "field"
                        }
                    ]
                }],
                id: "#b"
            };
            const input = new SBDraft2CommandInputParameterModel(<CommandInputParameter>data);
            expect(input.serialize()).to.deep.equal(data);
        });

        it("Should serialize with custom properties", () => {
            const data  = {
                type: ["null", "string"],
                id: "#b",
                "pref:customprop": "some value",
                "pref:otherprop": {
                    complex: "value"
                }
            };
            const input = new SBDraft2CommandInputParameterModel(data);
            expect(input.serialize()).to.deep.equal(data);
        });

        it("Should remove File-specific attributes if type is not file", () => {
            const data      = {
                type: ["null", "File"],
                id: "#b",
                inputBinding: {
                    secondaryFiles: ["bam", "bai"]
                }
            };
            const input     = new SBDraft2CommandInputParameterModel(data);
            input.type.type = "string";

            expect(input.serialize().inputBinding).to.not.haveOwnProperty("secondaryFiles");

        })

    });

    describe("secondaryFiles", () => {
        it("should updateSecondaryFile with string value", () => {
            const obj = {
                id: "input",
                type: ["File"],
                inputBinding: {
                    secondaryFiles: [
                        ".bai",
                        ".bti"
                    ]
                }
            };

            const bind = new SBDraft2CommandInputParameterModel(obj, "input");
            expect(bind.secondaryFiles[1].serialize()).to.equal(".bti");

            bind.updateSecondaryFiles([".txt"]);

            expect(bind.secondaryFiles[0].serialize()).to.equal(".txt");
            expect(bind.secondaryFiles[0].loc).to.equal("input.inputBinding.secondaryFiles[0]");
        });

        it("should removeSecondaryFile at index", () => {
            const obj = {
                id: "input",
                type: ["File"],
                inputBinding: {
                    secondaryFiles: [
                        ".bai",
                        ".bti"
                    ]
                }
            };

            const input = new SBDraft2CommandInputParameterModel(obj, "input");
            expect(input.secondaryFiles).to.have.length(2);

            input.removeSecondaryFile(0);

            expect(input.secondaryFiles).to.have.length(1);
            expect(input.secondaryFiles[0].serialize()).to.equal(".bti");

            expect(input.secondaryFiles[0].loc).to.equal("input.inputBinding.secondaryFiles[1]");
        });

        it("should addSecondaryFile to the end of the list", () => {
            const obj = {
                id: "input",
                type: ["File"],
                inputBinding: {
                    secondaryFiles: [
                        ".bai",
                        ".bti"
                    ]
                }
            };

            const bind = new SBDraft2CommandInputParameterModel(obj, "input");

            bind.addSecondaryFile(".txt");


            expect(bind.secondaryFiles).to.have.length(3);
            expect(bind.secondaryFiles[2].serialize()).to.equal(".txt");

            expect(bind.secondaryFiles[2].loc).to.equal("input.inputBinding.secondaryFiles[2]");
        });
    })

});
