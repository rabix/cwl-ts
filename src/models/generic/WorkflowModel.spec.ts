import {expect} from "chai";
import {WorkflowFactory} from "./WorkflowFactory";
import * as FirstWF from "../../tests/apps/first-workflow";
import * as DisconnectedFirstWF from "../../tests/apps/disconnected-first-workflow";


describe("WorkflowModel", () => {
   describe("gatherIncoming", () => {
      it("should return a list of all possible incoming connection points", () => {
          const wf = WorkflowFactory.from(FirstWF.default);
          const sources = wf.gatherSources();

          expect(sources).to.not.be.empty;
          expect(sources).to.have.length(5);
      });
   });

   describe("gatherOutgoing", () => {
      it("should return a list of all possible outgoing connection points", () => {
         const wf = WorkflowFactory.from(FirstWF.default);
         const destinations = wf.gatherDestinations();

         expect(destinations).to.not.be.empty;
         expect(destinations).to.have.length(4)
      });
   });

   describe("constructGraph", () => {
       it("should construct a graph", () => {
           const wf = WorkflowFactory.from(FirstWF.default);

           const g = wf.constructGraph();
           expect(g.hasCycles()).to.be.false;
           expect(g.isConnected()).to.be.true;
       });
   });

   describe("isConnected", () => {
       it("should return true for connected workflow", () => {
           const wf = WorkflowFactory.from(FirstWF.default);

           const g = wf.constructGraph();
           expect(g.isConnected()).to.be.true;
       });

       it("should return false for disconnected workflow", () => {
           const wf = WorkflowFactory.from(DisconnectedFirstWF.default);

           const g = wf.constructGraph();
           expect(g.isConnected()).to.be.false;
       });
   });



});