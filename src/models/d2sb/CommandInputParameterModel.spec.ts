import {CommandInputParameterModel} from "./CommandInputParameterModel";
import {expect} from "chai";

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
            //@todo(maya) this test is currently failing, booleans are not going through itemsPrefix
            expect(part.value).to.equal("--bool-arr -i -i");
        });


    });

    describe("constructor", () => {
        it("should create new input from no parameters", () => {
            const input = new CommandInputParameterModel("");

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

    describe("validation", () => {

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

            input.addField({
                name: "field",
                type: "string"
            });

            expect(input.fields).to.have.length(1);
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
                input.addField({
                    name: "field",
                    type: "string"
                });
            }).to.throw;
            expect(input.fields).to.be.null;
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

            input.addField({
                name: "field",
                type: "string"
            });

            expect(input.fields).to.have.length(1);
            input.removeField("field");
            expect(input.fields).to.have.length(0);
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

            input.addField(field);

            expect(input.fields).to.have.length(1);
            input.removeField(field);
            expect(input.fields).to.have.length(0);
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

            input.addField({
                name: "field",
                type: "string"
            });

            expect(() => {
                input.addField({
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

            input.addField({
                name: "field",
                type: "string"
            });

            expect(input.fields).to.have.length(1);
            expect(() => {
                input.removeField("boo");
            }).to.throw;
        });
    });

    describe("type", () => {
        // set type
        it("should set type by string", () => {
            const input = new CommandInputParameterModel("");

            input.setType("string");
            expect(input.getType()).to.equal("string");
        });

    });

    describe("items", () => {
        // set items type
        it("should set items for array type", () => {
            const input = new CommandInputParameterModel("", {
                id: "a",
                type: {type: "array", items: "int"}
            });

            input.setItems("string");
            expect(input.items).to.equal("string");
        });

        // set items type on non-array
        it("should not set items for type that's not array", () => {
            const input = new CommandInputParameterModel("", {
                id: "a",
                type: {type: "record", fields: []}
            });

            expect(() => {
                input.setItems("string");
            }).to.throw;
        });
    });

    describe("symbols", () => {
        // add symbol

        //
    });

    describe("toString", () => {
        // json

        // all the types

        // yaml

        // all the types
    });

    describe("setValueFrom", () => {
        it("Should set the valueFrom property in the inputBinding", () => {
            const input = new CommandInputParameterModel("", {
                id: "a",
                type: {type: "array", items: "int"}
            });

            input.setValueFrom("asd 123");

            expect(input.getValueFrom().toString()).to.equal("asd 123");
        });
    });

    describe("hasInputBinding", () => {

        it("Should return true if there is a an inputBinding", () => {
            const input = new CommandInputParameterModel("", {
                id: "a",
                type: {type: "array", items: "int"}
            });

            input.setValueFrom("asd 123");
            expect(input.hasInputBinding()).to.equal(true);
        });

        it("Should return false if there is no inputBinding", () => {
            const input = new CommandInputParameterModel("", {
                id: "a",
                type: {type: "array", items: "int"}
            });

            expect(input.hasInputBinding()).to.equal(false);
        });
    });

    describe("removeInputBinding", () => {

        it("Should remove the inputBinding property", () => {
            const input = new CommandInputParameterModel("", {
                id: "a",
                type: {type: "array", items: "int"}
            });

            input.setValueFrom("asd 123");
            expect(input.hasInputBinding()).to.equal(true);

            input.removeInputBinding();
            expect(input.hasInputBinding()).to.equal(false);
        });

    });

});
