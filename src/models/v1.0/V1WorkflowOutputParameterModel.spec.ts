import {expect} from "chai";
import {V1WorkflowOutputParameterModel} from "./V1WorkflowOutputParameterModel";
import {WorkflowOutputParameter} from "../../mappings/v1.0/WorkflowOutputParameter";


describe("V1WorkflowOutputParameterModel", () => {
    let output: V1WorkflowOutputParameterModel;
    let serialize: WorkflowOutputParameter;
    beforeEach(() => {
        output = new V1WorkflowOutputParameterModel({
            id: "output",
            type: "File[]",
            format: "TXT",
            outputSource: "source_id",
            streamable: false,
            secondaryFiles: ["one", "two"],
            linkMerge: "merge_flattened",
            doc: "file description",
            label: "file label"
        });

        serialize = <WorkflowOutputParameter> output.serialize();
    });

    describe("serialize", () => {
        it("should return correct id", () => {
            expect(serialize.id).to.deep.equal("output")
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

        it("should return outSource", () => {
            expect(serialize.outputSource).to.contain("source_id");
        });

        it("should return linkMerge", () => {
            expect(serialize.linkMerge).to.equal("merge_flattened");
        });
    });
});