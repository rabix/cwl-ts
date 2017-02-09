import {expect} from "chai";
import {WorkflowFactory} from "./WorkflowFactory";
import * as OneStepWf from "../../tests/apps/one-step-wf";

describe("StepModel", () => {
    describe("inAsMap", () => {
        it("should serialize in property as a map", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            const step = wf.steps[0];

            expect(Object.keys(step.inAsMap)).to.deep.equal(step.in.map(i => i.id));

        });
    });
});