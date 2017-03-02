import {expect} from "chai";
import {WorkflowFactory} from "../generic/WorkflowFactory";
import * as OneStepWf from "../../tests/apps/one-step-wf-draf2";
import * as TwoStepWf from "../../tests/apps/two-step-wf-draft2";
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

   describe("changeStepId", () => {
      let wf: WorkflowModel;

      beforeEach(() => {
         wf = WorkflowFactory.from(OneStepWf.default);
      });

      it("should change id of step itself", () => {
         const step = wf.steps[0];

         wf.changeStepId(step, "new_id");

         expect(step.id).to.equal("new_id");
      });

      it("should maintain the same number of connections and nodes after id change", () => {
         const connectionsLen = wf.connections.length;
         const nodesLen = wf.nodes.length;

         wf.changeStepId(wf.steps[0], "new_id");

         expect(wf.connections).to.have.length(connectionsLen);
         expect(wf.nodes).to.have.length(nodesLen);
      });

      it("should change source for connected outputs", () => {
         wf.changeStepId(wf.steps[0], "new_id");

         expect(wf.outputs[0].source).to.deep.equal(["#new_id.fileOutput"]);
      });

      it("should change source for connected step inputs", () => {
         const wf = WorkflowFactory.from(TwoStepWf.default);

         wf.changeStepId(wf.steps[0], "new_id");

         expect(wf.steps[1].in[0].source).to.deep.equal(["#new_id.result"]);
      });
   });
});