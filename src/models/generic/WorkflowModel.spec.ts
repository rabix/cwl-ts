import {expect} from "chai";
import {WorkflowFactory} from "./WorkflowFactory";
import * as FirstWF from "../../tests/apps/first-workflow";
import * as TypelessFirstWF from "../../tests/apps/typeless-first-workflow";
import * as EmbeddedFirstWF from "../../tests/apps/embedded-first-wf";
import * as EmbeddedFileTypeFirstWF from "../../tests/apps/embedded-filetype-first-wf";
import * as DisconnectedFirstWF from "../../tests/apps/disconnected-first-workflow";
import * as CyclicalWF from "../../tests/apps/cyclical-first-wf";
import * as OneStepWF from "../../tests/apps/one-step-wf";
import {WorkflowInputParameterModel} from "./WorkflowInputParameterModel";


describe("WorkflowModel", () => {
   describe("gatherSources", () => {
      it("should return a list of all possible incoming connection points", () => {
          const wf = WorkflowFactory.from(FirstWF.default);
          const sources = wf.gatherSources();

          expect(sources).to.not.be.empty;
          expect(sources).to.have.length(5);
      });
   });

   describe("gatherValidSources", () => {
       it("should return all sources if workflow defines no types", () => {
           const wf = WorkflowFactory.from(TypelessFirstWF.default);
           const validSources = wf.gatherValidSources(wf.steps[0].in[0]);

           expect(validSources).to.not.be.empty;
           expect(validSources).to.have.length(4);
       });

       it("should return only sources of the same type", () => {
           const wf = WorkflowFactory.from(EmbeddedFirstWF.default);
           // destination with type File
           const validSourcesFile = wf.gatherValidSources(wf.steps[0].in[0]);

           expect(validSourcesFile).to.not.be.empty;
           expect(validSourcesFile).to.have.length(2);
           expect(validSourcesFile[0].type.type).to.equal("File");
           expect(validSourcesFile[1].type.type).to.equal("File");

           // destination with type string
           const validSourcesString = wf.gatherValidSources(wf.steps[0].in[1]);
           expect(validSourcesString).to.not.be.empty;
           expect(validSourcesString).to.have.length(1);
           expect(validSourcesString[0].type.type).to.equal("string");
           expect(validSourcesString[0]).instanceof(WorkflowInputParameterModel);
       });

       it("should return only sources with same fileTypes if destination is File", () => {
           const wf = WorkflowFactory.from(EmbeddedFileTypeFirstWF.default);
           const validSourcesFile = wf.gatherValidSources(wf.steps[0].in[0]);

           expect(validSourcesFile).to.not.be.empty;
           expect(validSourcesFile).to.have.length(1);
           expect(validSourcesFile[0].type.type).to.equal("File");
           expect(validSourcesFile[0].fileTypes).to.deep.equal(["TXT"]);
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