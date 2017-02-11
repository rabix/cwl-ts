import {expect} from "chai";
import * as OneStepWf from "../../tests/apps/one-step-wf";
import {WorkflowFactory} from "../generic/WorkflowFactory";

describe("V1WorkflowModel", () => {
   describe("exposePort", () => {
       it("should add a new input on the workflow and connect it to port", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            expect(wf.steps).to.have.length(1);
            expect(wf.inputs).to.have.length(1);
            expect(wf.connections).to.have.length(5);
            wf.exposePort(wf.steps[0].in[1]);

           expect(wf.inputs).to.have.length(2);
           expect(wf.inputs[1].id).to.equal(wf.steps[0].in[1].id);
           expect(wf.connections).to.have.length(6);
       });
   });

   describe("includePort", () => {
       it("should set port to visible", () => {
           const wf = WorkflowFactory.from(OneStepWf.default);

           expect(wf.steps[0].in[1].isVisible).to.be.false;

           wf.includePort(wf.steps[0].in[1]);

           expect(wf.steps[0].in[1].isVisible).to.be.true;
       });
   })
});