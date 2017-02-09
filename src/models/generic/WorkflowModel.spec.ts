import {expect} from "chai";
import {WorkflowFactory} from "./WorkflowFactory";
import * as FirstWF from "../../tests/apps/first-workflow";
import * as DisconnectedFirstWF from "../../tests/apps/disconnected-first-workflow";
import * as CyclicalWF from "../../tests/apps/cyclical-first-wf";
import * as OneStepWF from "../../tests/apps/one-step-wf";


describe("WorkflowModel", () => {
   describe("gatherSources", () => {
      it("should return a list of all possible incoming connection points", () => {
          const wf = WorkflowFactory.from(FirstWF.default);
          const sources = wf.gatherSources();

          expect(sources).to.not.be.empty;
          expect(sources).to.have.length(5);
      });
   });

   describe("gatherDestinations", () => {
      it("should return a list of all possible outgoing connection points", () => {
         const wf = WorkflowFactory.from(FirstWF.default);
         const destinations = wf.gatherDestinations();

         expect(destinations).to.not.be.empty;
         expect(destinations).to.have.length(4)
      });
   });

   describe("constructGraph", () => {
       it("should construct a graph with appropriate number of edges and vertices", () => {
           const wf = WorkflowFactory.from(FirstWF.default);
           const g = wf.constructGraph();

           console.log("graph edges", Array.from(g.edges));
           expect(g.edges.size).to.equal(10);

           expect(g.vertices.size).to.equal(11);
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

    describe("hasCycles", () => {
        it("should return true for cyclical workflow", () => {
            const wf = WorkflowFactory.from(CyclicalWF.default);

            const g = wf.constructGraph();
            expect(g.hasCycles()).to.be.true;
        });

        it("should return false for acyclical workflow", () => {
            const wf = WorkflowFactory.from(FirstWF.default);

            const g = wf.constructGraph();
            expect(g.hasCycles()).to.be.false;
        });
    });

    describe("connections", () => {
        it("should distinguish between visible and invisible connections", () => {
            const wf = WorkflowFactory.from(OneStepWF.default);

            expect(wf.connections).to.have.length(5);
            expect(wf.connections.filter(con => con.isVisible)).to.have.lengthOf(2);
        });

        it("should not show connections to steps as visible", () => {
            const wf = WorkflowFactory.from(OneStepWF.default);

            const visibleConn = wf.connections.filter(con => con.isVisible);
            const sources = visibleConn.map(edge => edge.source.type);
            const destinations = visibleConn.map(edge => edge.destination.type);

            expect(sources).to.not.contain("Step");
            expect(destinations).to.not.contain("Step");
        });
    })
});