import {CommandInputParameterModel} from "./CommandInputParameterModel";
import {expect} from "chai/index";

describe("CommandInputParameterModel d2sb", () => {

    describe("getCommandLinePart", () => {
        // file

        // array of files

        // int

        // array of int

        // float

        // array of float

        // enum

        // array of enum

        // boolean
        it("Should evaluate a boolean set to true", () => {
            const input = new CommandInputParameterModel({
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
            const input = new CommandInputParameterModel({
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
            const input = new CommandInputParameterModel({
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
            const input = new CommandInputParameterModel({
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
            const input = new CommandInputParameterModel({
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
            const input = new CommandInputParameterModel();

            expect(input).to.not.be.undefined;
        });

        it("should create new input from object", () => {
            const input = new CommandInputParameterModel({
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
            const input = new CommandInputParameterModel({
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
            const input = new CommandInputParameterModel({
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
            const input = new CommandInputParameterModel({
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
            const input = new CommandInputParameterModel({
                id: "baz",
                type: {
                    type: "record",
                    fields: []
                }
            });

            const field = new CommandInputParameterModel({
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
            const input = new CommandInputParameterModel({
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
            const input = new CommandInputParameterModel({
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
            const input = new CommandInputParameterModel();

            input.setType("string");
            expect(input.getType()).to.equal("string");
        });

    });

    describe("items", () => {
        // set items type
        it("should set items for array type", () => {
            const input = new CommandInputParameterModel({
                id: "a",
                type: {type: "array", items: "int"}
            });

            input.setItems("string");
            expect(input.items).to.equal("string");
        });

        // set items type on non-array
        it("should not set items for type that's not array", () => {
            const input = new CommandInputParameterModel({
                id: "a",
                type: {type: "record", fields: []}
            });

            expect(() => {
                input.setItems("string");
            }).to.throw;
        });
    });

    // symbols
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
});
