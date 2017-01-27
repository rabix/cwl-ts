import {expect} from "chai";
import {WorkflowFactory} from "./WorkflowFactory";
import * as FirstWF from "../../tests/apps/first-workflow";


describe("WorkflowModel", () => {
   describe("gatherIncoming", () => {
      it("Should return a list of all possible incoming connection points", () => {
          const wf = WorkflowFactory.from(FirstWF.default);
          const sources = wf.gatherSources();

          expect(sources).to.not.be.empty;
          expect(sources).to.have.length(5);
      });
   });

   describe("gatherOutgoing", () => {
      it("Should return a list of all possible outgoing connection points", () => {
         const wf = WorkflowFactory.from(FirstWF.default);
         const destinations = wf.gatherDestinations();

         expect(destinations).to.not.be.empty;
         expect(destinations).to.have.length(4)
      });
   });
});