import {expect} from "chai";
import * as OneStepWf from "../../tests/apps/one-step-wf";
import * as TwoStepWf from "../../tests/apps/first-workflow";
import {WorkflowFactory} from "../generic/WorkflowFactory";
import {WorkflowModel} from "../generic/WorkflowModel";

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
           expect(wf.steps[1].in).to.not.be.empty;
           expect(wf.steps[1].in).to.have.length(1);
           expect(wf.steps[1].out).to.not.be.empty;
           expect(wf.steps[1].out).to.have.length(1);
       });

       it("should add step to graph", () => {
           expect(wf.nodes).to.have.length(6);

           wf.addStepFromProcess(OneStepWf.default);

           expect(wf.nodes).to.have.length(9);
       });

       it("should add the same app twice without conflict", () => {
           expect(wf.nodes).to.have.length(6);

           wf.addStepFromProcess(OneStepWf.default);
           expect(wf.nodes).to.have.length(9);

           wf.addStepFromProcess(OneStepWf.default);
           expect(wf.nodes).to.have.length(12);
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

            expect(wf.outputs[0].source).to.deep.equal(["new_id/example_out"]);
        });

        it("should change source for connected step inputs", () => {
            const wf = WorkflowFactory.from(TwoStepWf.default);

            wf.changeStepId(wf.steps[0], "new_id");

            expect(wf.steps[1].in[0].source).to.deep.equal(["new_id/example_out"]);
        });
    });

    describe("changeIONodeId", () => {
        it("should change id for input", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            const input = wf.inputs[0];

            wf.changeIONodeId(input, "new_id");

            expect(input.id).to.equal("new_id");
        });

        it("should change id for output", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            const output = wf.outputs[0];

            wf.changeIONodeId(output, "new_id");

            expect(output.id).to.equal("new_id");
        });

        it("should maintain the same number of connections and nodes after output id change", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            const connectionsLen = wf.connections.length;
            const nodesLen = wf.nodes.length;

            wf.changeIONodeId(wf.outputs[0], "new_id");

            expect(wf.connections).to.have.length(connectionsLen);
            expect(wf.nodes).to.have.length(nodesLen);
        });

        it("should maintain the same number of connections and nodes after input id change", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            const connectionsLen = wf.connections.length;
            const nodesLen = wf.nodes.length;

            wf.changeIONodeId(wf.inputs[0], "new_id");

            expect(wf.connections).to.have.length(connectionsLen);
            expect(wf.nodes).to.have.length(nodesLen);
        });

        it("should change source for connected step.in", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            wf.changeIONodeId(wf.inputs[0], "new_id");

            expect(wf.steps[0].in[0].source).to.deep.equal(["new_id"]);
        });

        it("should throw exception if id exists", () => {
            const wf = WorkflowFactory.from(TwoStepWf.default);

            expect(() => {wf.changeIONodeId(wf.inputs[0], wf.inputs[1].id)}).to.throw(`ID already exists on graph`);
        });

        it("should throw exception if id is invalid", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            expect(() => {wf.changeIONodeId(wf.inputs[0], "-char-problems!")}).to.throw(`illegal characters`);
        });

        it("should throw exception if id is blank", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            expect(() => {wf.changeIONodeId(wf.inputs[0], "")}).to.throw(`must be set`);
        });
    });
});