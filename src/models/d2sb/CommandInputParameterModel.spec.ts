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


});
