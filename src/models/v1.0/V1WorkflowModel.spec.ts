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

        it("should include in ports after being exposed", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            const inPort = wf.steps[0].in[1];
            wf.exposePort(inPort);
            expect(wf.inputs).to.have.length(2);
            expect(inPort.isVisible).to.be.false;
            expect(inPort.status).to.equal("exposed");

            wf.includePort(inPort);
            expect(wf.inputs).to.have.length(1);
            expect(inPort.isVisible).to.be.true;
            expect(inPort.status).to.equal("port");


            wf.exposePort(inPort);
            expect(wf.inputs).to.have.length(2);
            expect(inPort.isVisible).to.be.false;
            expect(inPort.status).to.equal("exposed");

        });

        it("should expose connected port", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            const inPort = wf.steps[0].in[0];
            expect(inPort.isVisible).to.be.true;
            expect(inPort.status).to.equal("port");

            wf.exposePort(inPort);
            expect(wf.inputs).to.have.length(1); // will replace input that existed with new input
            expect(inPort.isVisible).to.be.false;
            expect(inPort.status).to.equal("exposed");
        });
    });

    describe("includePort", () => {
        it("should set port to visible", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            const inPort = wf.steps[0].in[1];
            expect(inPort.isVisible).to.be.false;
            expect(inPort.status).to.equal("editable");

            wf.includePort(inPort);

            expect(inPort.isVisible).to.be.true;
            expect(inPort.status).to.equal("port");

        });
    });

    describe("clearPort", () => {
        it("should set port to invisible and remove its connections", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            expect(wf.connections).to.have.length(5);

            wf.clearPort(wf.steps[0].in[0]);
            expect(wf.connections).to.have.length(4);

        });

        it("should remove connections with this port", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            const inPort = wf.steps[0].in[0];
            expect(inPort.isVisible).to.be.true;
            wf.clearPort(inPort);
            expect(inPort.isVisible).to.be.false;
        });

        it("should remove connected input on cleared port if input has no connection", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            const inPort = wf.steps[0].in[0];
            expect(inPort.isVisible).to.be.true;
            expect(wf.inputs).to.have.length(1);
            expect(inPort.status).to.equal("port");

            wf.clearPort(inPort);
            expect(inPort.status).to.equal("editable");
            expect(wf.inputs).to.have.length(0);
        });

        it("should clear included port", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            const inPort = wf.steps[0].in[1];
            expect(inPort.isVisible).to.be.false;
            expect(inPort.status).to.equal("editable");

            wf.includePort(inPort);

            expect(inPort.isVisible).to.be.true;
            expect(inPort.status).to.equal("port");

            wf.clearPort(inPort);

            expect(inPort.status).to.equal("editable");
            expect(inPort.isVisible).to.be.false;
        });


        it("should clear exposed port", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            const inPort = wf.steps[0].in[1];
            expect(inPort.isVisible).to.be.false;
            expect(inPort.status).to.equal("editable");

            wf.exposePort(inPort);

            expect(inPort.isVisible).to.be.false;
            expect(inPort.status).to.equal("exposed");

            wf.clearPort(inPort);

            expect(inPort.status).to.equal("editable");
            expect(inPort.isVisible).to.be.false;
        });
    });

    describe("addStepFromProcess", () => {
       it("should add a new step with a workflow to existing workflow", () => {
           const wf = WorkflowFactory.from(OneStepWf.default);
           expect(wf.steps).to.have.length(1);

           wf.addStepFromProcess(OneStepWf.default);
           expect(wf.steps).to.have.length(2);
       });

       it("should populate in and out of new step", () => {
           const wf = WorkflowFactory.from(OneStepWf.default);

           wf.addStepFromProcess(OneStepWf.default);
           expect(wf.steps[1].in).to.not.be.empty;
           expect(wf.steps[1].in).to.have.length(1);
           expect(wf.steps[1].out).to.not.be.empty;
           expect(wf.steps[1].out).to.have.length(1);
       });

       it("should add step to graph", () => {
           const wf = WorkflowFactory.from(OneStepWf.default);

           expect(wf.nodes).to.have.length(6);

           wf.addStepFromProcess(OneStepWf.default);

           expect(wf.nodes).to.have.length(9);
       })
    });
});