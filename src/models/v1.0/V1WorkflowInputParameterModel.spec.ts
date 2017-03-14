import {expect} from "chai";
import {V1WorkflowInputParameterModel} from "./V1WorkflowInputParameterModel";
import {InputParameter} from "../../mappings/v1.0/InputParameter";


describe("V1WorkflowInputParameterModel", () => {
    let input: V1WorkflowInputParameterModel;
    let serialize: InputParameter;
    beforeEach(() => {
        input = new V1WorkflowInputParameterModel({
            id: "input",
            type: "File[]",
            format: "TXT",
            streamable: false,
            secondaryFiles: ["one", "two"],
            doc: "file description",
            label: "file label"
        });

        serialize = <InputParameter> input.serialize();
    });

    describe("serialize", () => {
        it("should return correct id", () => {
            expect(serialize.id).to.deep.equal("input")
        });

        it("should return type with shorthand", () => {
            expect(serialize.type).to.equal("File[]");
        });

        it("should return streamable", () => {
             expect(typeof serialize.streamable).to.equal("boolean");
             expect(serialize.streamable).to.equal(false);
        });

        it("should return secondaryFiles as an array", () => {
            expect(serialize.secondaryFiles).to.deep.equal(["one", "two"]);
        });

        it("should return doc", () => {
            expect(serialize.doc).to.equal("file description");
        });

        it("should return label", () => {
            expect(serialize.label).to.equal("file label");
        });
    });
});