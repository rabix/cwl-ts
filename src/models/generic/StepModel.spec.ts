import {expect} from "chai";
import {WorkflowFactory} from "./WorkflowFactory";
import * as OneStepWf from "../../tests/apps/one-step-wf";
import {StepModel} from "./StepModel";

describe("StepModel", () => {
    describe("inAsMap", () => {
        it("should serialize in property as a map", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            const step = wf.steps[0];

            expect(Object.keys(step.inAsMap)).to.deep.equal(step.in.map(i => i.id));

        });
    });

    describe("portDifference", () => {
        it("should return all removed", () => {
            const [inserted, remaining, removed] = StepModel.portDifference([{id: "A"}, {id: "B"}] as any, []);

            expect(inserted).to.have.lengthOf(0);
            expect(remaining).to.have.lengthOf(0);
            expect(removed).to.have.lengthOf(2);
        });

        it("should return all inserted", () => {
            const [inserted, remaining, removed] = StepModel.portDifference([], [{id: "A"}, {id: "B"}] as any);

            expect(inserted).to.have.lengthOf(2);
            expect(remaining).to.have.lengthOf(0);
            expect(removed).to.have.lengthOf(0);
        });

        it("should return all remaining", () => {
            const [inserted, remaining, removed] = StepModel.portDifference([{id: "A"}, {id: "B"}] as any, [{id: "A"}, {id: "B"}] as any);

            expect(inserted).to.have.lengthOf(0);
            expect(remaining).to.have.lengthOf(2);
            expect(removed).to.have.lengthOf(0);
        });

        it("should return mix remaining, removed and inserted", () => {
            const [inserted, remaining, removed] = StepModel.portDifference([{id: "A"}, {id: "B"}, {id: "C"}] as any, [{id: "A"}, {id: "Q"}] as any);

            expect(inserted).to.have.lengthOf(1);
            expect(inserted[0].id).to.equal("Q");
            expect(remaining).to.have.lengthOf(1);
            expect(remaining[0].id).to.equal("A");
            expect(removed).to.have.lengthOf(2);
            expect(removed[0].id).to.equal("B");
            expect(removed[1].id).to.equal("C");
        });
    })
});