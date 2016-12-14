import {CommandInputParameterModel} from "./CommandInputParameterModel";
import {expect} from "chai";
import {CommandInputParameter} from "../../mappings/d2sb/CommandInputParameter";
import {ExpressionClass} from "../../mappings/d2sb/Expression";

describe("CommandInputParameterModel d2sb", () => {

    describe("getCommandLinePart", () => {
        // file
        it("Should evaluate a File", () => {
            const input = new CommandInputParameterModel("", {
                id: "i",
                type: ["File"],
                inputBinding: {
                    prefix: "--file"
                }
            });

            const part = input.getCommandPart(null, {path: "/path/to/File"});
            expect(part.value).to.equal("--file /path/to/File");
        });

        it("Should evaluate a File with valueFrom", () => {
            const input = new CommandInputParameterModel("", {
                id: "i",
                type: ["File"],
                inputBinding: {
                    prefix: "--file",
                    valueFrom: {
                        "class": "Expression",
                        engine: "#cwl-js-engine",
                        script: "$self.path.split('/')[0]"
                    }
                }
            });

            const part = input.getCommandPart(null, {path: "path/to/File"});
            expect(part.value).to.equal("--file path");
        });

        // array of files

        it("Should evaluate a File[]", () => {
            const input = new CommandInputParameterModel("", {
                id: "i",
                type: [{
                    type: "array",
                    items: "File"
                }],
                inputBinding: {}
            });

            const part = input.getCommandPart(null, [{path: "path/to/File"}, {path: "path/to/File2"}]);
            expect(part.value).to.equal("path/to/File path/to/File2");
        });

        it("Should evaluate a File[] with prefix", () => {
            const input = new CommandInputParameterModel("", {
                id: "i",
                type: [{
                    type: "array",
                    items: "File"
                }],
                inputBinding: {
                    prefix: "--file"
                }
            });

            const part = input.getCommandPart(null, [{path: "path/to/File"}, {path: "path/to/File2"}]);
            expect(part.value).to.equal("--file path/to/File path/to/File2");
        });

        it("Should evaluate a File[] with valueFrom");

        // int

        it("Should evaluate a int");

        it("Should evaluate a int with valueFrom");

        // array of int

        it("Should evaluate a int[]");

        it("Should evaluate a int[] with valueFrom");

        it("Should evaluate a int[] with valueFrom and itemSeparator", () => {
            const input = new CommandInputParameterModel("", {
                "id": "#min_std_max_min",
                "type": {
                    "type": "array",
                    "items": "int"
                },
                "inputBinding": {
                    "prefix": "-I",
                    "itemSeparator": ","
                }
            });

            const part = input.getCommandPart(null, [1, 2, 3, 4]);
            expect(part.value).to.equal("-I 1,2,3,4");

        });

        // float

        it("Should evaluate a float");

        it("Should evaluate a float with valueFrom");

        // array of float

        it("Should evaluate a float[]");

        it("Should evaluate a float[] with valueFrom");

        // enum

        it("Should evaluate a enum");

        it("Should evaluate a enum with valueFrom");

        // array of enum

        it("Should evaluate a enum[]");

        it("Should evaluate a enum[] with valueFrom");

        // boolean
        it("Should evaluate a boolean set to true", () => {
            const input = new CommandInputParameterModel("", {
                id: "i",
                type: ["boolean"],
                inputBinding: {
                    prefix: "--bool"
                }
            });

            const part = input.getCommandPart(null, true);
            expect(part.value).to.equal("--bool");
        });

        it("Should evaluate a boolean set to true with valueFrom", () => {
            const input = new CommandInputParameterModel("", {
                id: "i",
                type: ["boolean"],
                inputBinding: {
                    prefix: "--bool",
                    valueFrom: "baz",
                    separate: true
                }
            });

            const part = input.getCommandPart(null, true);
            expect(part.value).to.equal("--bool baz");
        });

        it("Should evaluate a boolean set to false", () => {
            const input = new CommandInputParameterModel("", {
                id: "i",
                type: ["boolean"],
                inputBinding: {
                    prefix: "--bool"
                }
            });

            const part = input.getCommandPart(null, false);
            expect(part.value).to.equal("");
        });

        it("Should evaluate a boolean set to false with valueFrom", () => {
            const input = new CommandInputParameterModel("", {
                id: "i",
                type: ["boolean"],
                inputBinding: {
                    prefix: "--bool",
                    valueFrom: "baz",
                    separate: true
                }
            });

            const part = input.getCommandPart(null, false);
            expect(part.value).to.equal("");
        });

        // array of boolean
        it("Should evaluate an array of boolean", () => {
            const input = new CommandInputParameterModel("", {
                id: "i",
                type: {
                    type: "array",
                    items: "boolean",
                    inputBinding: {
                        prefix: "-i"
                    }
                },
                inputBinding: {
                    prefix: "--bool-arr"
                }
            });

            const part = input.getCommandPart(null, [true, true, false]);
            expect(part.value).to.equal("--bool-arr -i -i");
        });


    });

    describe("constructor", () => {
        it("should create new input from no parameters", () => {
            const input = new CommandInputParameterModel();

            expect(input).to.not.be.undefined;
        });

        it("should create new input from object", () => {
            const input = new CommandInputParameterModel("", {
                id: "d",
                type: "string"
            });

            expect(input).to.not.be.undefined;
        });
    });

    describe("fields", () => {
        // add field
        it("should add a field as object literal to an input type record", () => {
            const input = new CommandInputParameterModel("", {
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
            const input = new CommandInputParameterModel("", {
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
            const input = new CommandInputParameterModel("", {
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
            const input = new CommandInputParameterModel("", {
                id: "baz",
                type: {
                    type: "record",
                    fields: []
                }
            });

            const field = new CommandInputParameterModel("", {
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
            const input = new CommandInputParameterModel("", {
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
            const input = new CommandInputParameterModel("", {
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
            const input = new CommandInputParameterModel("");

            input.type.type = "string";
            expect(input.type.type).to.equal("string");
        });

    });

    describe("items", () => {
        // set items type
        it("should set items for array type", () => {
            const input = new CommandInputParameterModel("", {
                id: "a",
                type: {type: "array", items: "int"}
            });

            input.type.items = "string";
            expect(input.type.items).to.equal("string");
        });

        // set items type on non-array
        it("should not set items for type that's not array", () => {
            const input = new CommandInputParameterModel("", {
                id: "a",
                type: {type: "record", fields: []}
            });

            expect(() => {
                input.type.items = "string";
            }).to.throw;
        });
    });

    describe("symbols", () => {
        it("should add symbols")
    });

    describe("setValueFrom", () => {
        it("Should set the valueFrom property in the inputBinding", () => {
            const input = new CommandInputParameterModel("", {
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
            const input = new CommandInputParameterModel("", {
                id: "a",
                type: {type: "array", items: "int"}
            });

            input.createInputBinding();
            input.inputBinding.setValueFrom("asd 123");
            expect(input.isBound).to.equal(true);
        });

        it("Should return false if there is no inputBinding", () => {
            const input = new CommandInputParameterModel("", {
                id: "a",
                type: {type: "array", items: "int"}
            });

            expect(input.isBound).to.equal(false);
        });
    });

    describe("removeInputBinding", () => {

        it("Should remove the inputBinding property", () => {
            const input = new CommandInputParameterModel("", {
                id: "a",
                type: {type: "array", items: "int"}
            });

            input.createInputBinding();
            input.inputBinding.setValueFrom("asd 123");
            expect(input.isBound).to.equal(true);

            input.removeInputBinding();
            expect(input.isBound).to.equal(false);
        });

    });

    describe("updateValidity", () => {
        it("Should be invalid if valueFrom is invalid", () => {
            const input = new CommandInputParameterModel("", {
                id: "i",
                type: ["boolean"],
                inputBinding: {
                    valueFrom: {
                        "class": "Expression",
                        engine: "#cwl-js-engine",
                        script: "---"
                    }
                }
            });

            input.validate();

            expect(input.validation.errors).to.not.be.empty;
            console.log(input.validation.errors.length);
        });

    });

    describe("validate", () => {
        it("Should check if ID exists", () => {
            const input = new CommandInputParameterModel("", {
                type: "string",
                id: ''
            });

            input.validate();
            expect(input.validation.errors).to.not.be.empty;
            expect(input.validation.errors[0].message).to.equal("ID must be set");
        });

        it("Should check for invalid characters in ID", () => {
            const input = new CommandInputParameterModel("", <CommandInputParameter>{
                type: "string",
                id: "@"
            });

            input.validate();
            expect(input.validation.errors).to.not.be.empty;
            expect(input.validation.errors[0].message).to.equal("ID can only contain alphanumeric and underscore characters");
        });

        it("Should ensure enum has symbols", () => {
            const input = new CommandInputParameterModel("inp", <CommandInputParameter>{
                id: "asdf",
                type: {
                    type: "enum"
                }
            });

            input.validate();

            expect(input.validation.errors).to.not.be.empty;
            expect(input.validation.errors[0].loc).to.equal("inp.type");
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
                    prefix: "--prefix"
                }
            };
            const input = new CommandInputParameterModel("", <CommandInputParameter>data);
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
                    valueFrom: {
                        'class': <ExpressionClass> "Expression",
                        engine: "#cwl-js-engine",
                        script: "{ return 3 + 3 + 3 }"
                    }
                }
            };
            const input = new CommandInputParameterModel("", data);
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
                            id: "#a",
                            label: "field"
                        }
                    ]
                }],
                id: "#b"
            };
            const input = new CommandInputParameterModel("", <CommandInputParameter>data);
            expect(input.serialize()).to.deep.equal(data);
        });

        it("Should serialize with custom properties", () => {
            const data = {
                type: ["null", "string"],
                id: "#b",
                "pref:customprop": "some value",
                "pref:otherprop": {
                    complex: "value"
                }
            };
            const input = new CommandInputParameterModel("", <CommandInputParameter>data);
            expect(input.serialize()).to.deep.equal(data);
        });

    });

});
