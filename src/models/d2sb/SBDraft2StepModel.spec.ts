import {WorkflowModel} from "../generic/WorkflowModel";
import {WorkflowFactory} from "../generic/WorkflowFactory";
import {expect} from "chai";
import * as OneStepWf from "../../tests/apps/one-step-wf-draf2";
import * as BasicTool from "../../tests/apps/basic-tool-draft2";

describe("SBDraft2StepModel", () => {
    describe("setRunProcess", () => {
        let wf: WorkflowModel;

        beforeEach(() => {
            wf = WorkflowFactory.from(OneStepWf.default);
        });

        it("should replace run with new app", () => {
            const step = wf.steps[0];
            expect(step.in).to.have.length(7);
            step.setRunProcess(BasicTool.default);
            expect(step.in).to.have.length(7);
        });

        /**
         * Functionality for errors on update hasn't been defined yet
         */
        it.skip("should set error for input missing in new run process", () => {
            const step = wf.steps[0];

            step.setRunProcess(BasicTool.default);
            expect(step.errors).to.not.be.empty;
            expect(step.errors[0].message).to.contain("not present");
        });

        /**
         * Functionality for errors on update hasn't been defined yet
         */
        it.skip("should set error for inputs with changed type", () => {
            const step = wf.steps[0];

            step.setRunProcess(BasicTool.default);
            expect(step.errors).to.not.be.empty;
            expect(step.errors[1].message).to.contain("Schema mismatch");
        });
    })
});