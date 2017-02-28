import {expect} from "chai";
import {WorkflowFactory} from "../generic/WorkflowFactory";
import * as OneStepWf from "../../tests/apps/one-step-wf-draf2";
import {WorkflowModel} from "../generic/WorkflowModel";


describe("SBDraft2WorkflowModel", () => {
   describe("addStepFromProcess", () => {
      let wf: WorkflowModel;

      beforeEach(() => {
         wf = WorkflowFactory.from(OneStepWf.default);
      });

      it("should add a new step with a workflow to existing workflow", () => {
         expect(wf.steps).to.have.length(1);

         wf.addStepFromProcess(OneStepWf.default);
         expect(wf.steps).to.have.length(2);
      });

      it("should populate in and out of new step", () => {
         wf.addStepFromProcess(OneStepWf.default);
         expect(wf.steps[1].id).to.not.be.empty;
         expect(wf.steps[1].in).to.not.be.empty;
         expect(wf.steps[1].in).to.have.length(3);
         expect(wf.steps[1].out).to.not.be.empty;
         expect(wf.steps[1].out).to.have.length(1);
      });

      it("should add the same app twice without conflict", () => {

         wf.addStepFromProcess(OneStepWf.default);
         expect(wf.steps).to.have.length(2);

         wf.addStepFromProcess(OneStepWf.default);
         expect(wf.steps).to.have.length(3);
      });
   });
});