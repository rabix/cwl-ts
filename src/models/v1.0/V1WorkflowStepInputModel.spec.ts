import {V1WorkflowStepInputModel} from "./V1WorkflowStepInputModel";
import {expect} from "chai";
import {V1ExpressionModel} from "./V1ExpressionModel";

describe("V1WorkflowStepInputModel", () => {
    describe("deserialize", () => {
        it("should deserialize without added properties", () => {
            const inp = new V1WorkflowStepInputModel({
                id: "inp",
                source: "source"
            });

            expect(inp.id).to.equal("inp");
            expect(inp.source).to.have.lengthOf(1);
            expect(inp.source[0]).to.equal("source");
        });

        it("should deserialize valueFrom field", () => {
            const inp = new V1WorkflowStepInputModel({
                id: "inp",
                valueFrom: "$(3+3)"
            });

            expect(inp.id).to.equal("inp");
            expect(inp.valueFrom).to.be.instanceOf(V1ExpressionModel);
            expect(inp.valueFrom.getScript()).to.equal("$(3+3)");
        });
    });

    describe("serialize", () => {
        it("should serialize with valueFrom", () => {
            const data = {
                id: "inp",
                source: ["out1", "out2"],
                valueFrom: "$(3+3)",
                linkMerge: "merge_flattened"
            };

            const inp  = new V1WorkflowStepInputModel(data as any);

            expect(inp.serialize()).to.deep.equal(data);
        });
    });
});