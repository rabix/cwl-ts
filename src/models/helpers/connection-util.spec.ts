import {V1StepModel, V1WorkflowInputParameterModel, V1WorkflowOutputParameterModel} from "../v1.0";
import {V1WorkflowStepInputModel} from "../v1.0/V1WorkflowStepInputModel";
import {V1WorkflowStepOutputModel} from "../v1.0/V1WorkflowStepOutputModel";
import {expect} from "chai";
import {checkIfConnectionIsValid} from "./connection-util";

describe("checkIfConnectionIsValid", () => {

    it("should be invalid when ource and destination port belong to the same step", () => {

        const parentStep = new V1StepModel();

        const input  = new V1WorkflowStepInputModel(null, parentStep);
        const output = new V1WorkflowStepOutputModel(null, parentStep);

        expect(() => checkIfConnectionIsValid(input, output))
            .to.throws("Invalid connection. Source and destination ports belong to the same step");

    });

    it("should be valid for same types or same items", () => {

        const inputFile = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File"
        });

        const outputFile = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: "File"
        });

        const inputFileArray = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "[File]"
        });

        const outputFileArray = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: "[File]"
        });

        expect(checkIfConnectionIsValid(inputFile, outputFile)).equal(true);
        expect(checkIfConnectionIsValid(inputFileArray, outputFileArray)).equal(true);

    });

    it("should be invalid for different types or different items", () => {

        const inputFile = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File"
        });

        const outputString = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: "string"
        });

        const inputFileArray = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File[]"
        });

        const outputStringArray = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: "string[]"
        });

        expect(() => checkIfConnectionIsValid(inputFile, outputString))
            .to.throw(`Invalid connection. Connection type mismatch, attempting to connect "File" to "string"`);

        expect(() => checkIfConnectionIsValid(inputFileArray, outputStringArray))
            .to.throw(`Invalid connection. Connection type mismatch, attempting to connect "File[]" to "string[]"`);

    });

    it("should be valid when source type is equal to destination items", () => {

        const inputFile = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File"
        });

        const outputFileArray = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: "File[]"
        });

        expect(checkIfConnectionIsValid(inputFile, outputFileArray)).equal(true);
    });

    it("should be invalid when destination type is equal to source items", () => {

        const inputFile = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File[]"
        });

        const outputFileArray = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: "File"
        });

        // inputFile to outputFileArray
        expect(() => checkIfConnectionIsValid(inputFile, outputFileArray))
            .to.throws(`Invalid connection. Connection type mismatch, attempting to connect "File[]" to "File"`);

        // outputFileArray to inputFile
        expect(checkIfConnectionIsValid(inputFile, outputFileArray, false)).equal(true);
    });

    it("should be valid when source (File) and destination (File) file-types have an intersection or one or both are empty", () => {

        const inputFile = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File"
        });


        const outputFile = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: "File"
        });

        inputFile.fileTypes  = [];
        outputFile.fileTypes = [];

        expect(checkIfConnectionIsValid(inputFile, outputFile)).equal(true);

        inputFile.fileTypes = ["s", "c", "d"];
        expect(checkIfConnectionIsValid(inputFile, outputFile)).equal(true);

        inputFile.fileTypes  = [];
        outputFile.fileTypes = ["B", "c", "d"];
        expect(checkIfConnectionIsValid(inputFile, outputFile)).equal(true);

        inputFile.fileTypes  = ["D", "c"];
        outputFile.fileTypes = ["b", "C", "d"];
        expect(checkIfConnectionIsValid(inputFile, outputFile)).equal(true);
    });

    it("should be valid when source (File[]) and destination (File[]) file-types have an intersection or one or both are empty", () => {

        const inputFileArray = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File[]"
        });


        const outputFileArray = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: "File[]"
        });

        inputFileArray.fileTypes  = [];
        outputFileArray.fileTypes = [];

        expect(checkIfConnectionIsValid(inputFileArray, outputFileArray)).equal(true);

        inputFileArray.fileTypes = ["s", "c", "d"];
        expect(checkIfConnectionIsValid(inputFileArray, outputFileArray)).equal(true);

        inputFileArray.fileTypes  = [];
        outputFileArray.fileTypes = ["B", "c", "d"];
        expect(checkIfConnectionIsValid(inputFileArray, outputFileArray)).equal(true);

        inputFileArray.fileTypes  = ["D", "c"];
        outputFileArray.fileTypes = ["b", "C", "d"];
        expect(checkIfConnectionIsValid(inputFileArray, outputFileArray)).equal(true);
    });

    it("should be invalid when source (File) and destination (File) file-types does not have an intersection", () => {

        const inputFile     = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File"
        });
        inputFile.fileTypes = ["a"];

        const outputFile = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: "File"
        });

        outputFile.fileTypes = ["d", "c"];

        expect(() => checkIfConnectionIsValid(inputFile, outputFile))
            .to.throws(`Invalid connection. File type mismatch, connecting formats "a" to "d,c"`);
    });

    it("should be invalid when source (File[]) and destination (File[]) file-types does not have an intersection", () => {

        const inputFileArray     = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File[]"
        });
        inputFileArray.fileTypes = ["a"];

        const outputFileArray = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: "File[]"
        });

        outputFileArray.fileTypes = ["d", "c"];

        expect(() => checkIfConnectionIsValid(inputFileArray, outputFileArray))
            .to.throws(`Invalid connection. File type mismatch, connecting formats "a" to "d,c"`);
    });

    it("should be valid when source is (File)[] and destination is (union)[]", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File[]"
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: {
                type: "array",
                items: ["File", "null"]
            }
        });

        expect(checkIfConnectionIsValid(input, output)).equal(true);

    });

    it("should be valid when source is object[] and destination is object[]", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: {
                type: "array",
                items: {
                    "items": "string",
                    "type": "array"
                }
            }
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: {
                type: "array",
                items: {
                    "items": "string",
                    "type": "array"
                }
            }
        });

        expect(checkIfConnectionIsValid(input, output)).equal(true);

    });

    it("should be valid when source is object[] and destination is union[]", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: {
                type: "array",
                items: {
                    "items": "string",
                    "type": "array"
                }
            }
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: {
                type: "array",
                items: ["File", "null"]
            }
        });

        expect(checkIfConnectionIsValid(input, output)).equal(true);

    });

    it("should be valid when source is union[] and destination is object[]", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: {
                type: "array",
                items: ["File", "null"]
            }
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: {
                type: "array",
                items: {
                    "items": "string",
                    "type": "array"
                }
            }
        });

        expect(checkIfConnectionIsValid(input, output)).equal(true);

    });

    it("should be valid when source is File and destination is union[]", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File"
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: {
                type: "array",
                items: ["File", "null"]
            }
        });

        expect(checkIfConnectionIsValid(input, output)).equal(true);
    });

    it("should be invalid when source is object[] and destination is File", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: {
                type: "array",
                items: {
                    "items": "string",
                    "type": "array"
                }
            }
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: "File"
        });

        expect(() => checkIfConnectionIsValid(input, output))
            .to.throw(`Invalid connection. Connection type mismatch, attempting to connect "object[]" to "File"`);
    });

    it("should be invalid when source is union[] and destination is File", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: {
                type: "array",
                items: ["File", "null"]
            }
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: "File"
        });

        expect(() => checkIfConnectionIsValid(input, output))
            .to.throw(`Invalid connection. Connection type mismatch, attempting to connect "union[]" to "File"`);
    });

    it("should be invalid when source is File and destination is object[]", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File"
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: {
                type: "array",
                items: {
                    "items": "string",
                    "type": "array"
                }
            }
        });

        expect(() => checkIfConnectionIsValid(input, output))
            .to.throw(`Invalid connection. Connection type mismatch, attempting to connect "File" to "object[]"`);
    });

    it("should be invalid when source is File[] and destination is object[]", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File[]"
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: {
                type: "array",
                items: {
                    "items": "string",
                    "type": "array"
                }
            }
        });

        expect(() => checkIfConnectionIsValid(input, output))
            .to.throw(`Invalid connection. Connection type mismatch, attempting to connect "File[]" to "object[]"`);
    });

    it("should be invalid when source is File and destination is record", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File"
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: {
                type: "record",
                fields: [
                    {
                        "name": "description",
                        "type": "string"
                    }]
            }
        });

        expect(() => checkIfConnectionIsValid(input, output))
            .to.throw(`Invalid connection. Connection type mismatch, attempting to connect "File" to "record"`);
    });

    it("should be valid when source is (record)[] and destination is (object)[]", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: {
                type: "array",
                items: {
                    type: "record",
                    fields: [{
                        name: "files",
                        type: "File[]"
                    }]
                }
            }
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: {
                type: "array",
                items: {
                    "items": "string",
                    "type": "array"
                }
            }
        });

        expect(checkIfConnectionIsValid(input, output)).equal(true);
    });

    it("should be valid when source is object[] and destination is record[]", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: {
                type: "array",
                items: {
                    "items": "string",
                    "type": "array"
                }
            }
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: {
                type: "array",
                items: {
                    type: "record",
                    fields: [{
                        name: "files",
                        type: "File[]"
                    }]
                }
            }
        });

        expect(checkIfConnectionIsValid(input, output)).equal(true);
    });

});
