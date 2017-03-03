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

        it("should change id of step itself", () => {
            const wf   = WorkflowFactory.from(OneStepWf.default);
            const step = wf.steps[0];

            wf.changeStepId(step, "new_id");

            expect(step.id).to.equal("new_id");
        });

        it("should maintain the same number of connections and nodes after id change", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            const connectionsLen = wf.connections.length;
            const nodesLen       = wf.nodes.length;

            wf.changeStepId(wf.steps[0], "new_id");

            expect(wf.connections).to.have.length(connectionsLen);
            expect(wf.nodes).to.have.length(nodesLen);
        });

        it("should change source for connected outputs", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            wf.changeStepId(wf.steps[0], "new_id");

            expect(wf.outputs[0].source).to.deep.equal(["#new_id.fileOutput"]);
        });

        it("should change source for connected step inputs", () => {
            const wf = WorkflowFactory.from(TwoStepWf.default);

            wf.changeStepId(wf.steps[0], "new_id");

            expect(wf.steps[1].in[0].source).to.deep.equal(["#new_id.result"]);
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
            const nodesLen       = wf.nodes.length;

            wf.changeIONodeId(wf.outputs[0], "new_id");

            expect(wf.connections).to.have.length(connectionsLen);
            expect(wf.nodes).to.have.length(nodesLen);
        });

        it("should maintain the same number of connections and nodes after input id change", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            const connectionsLen = wf.connections.length;
            const nodesLen       = wf.nodes.length;

            wf.changeIONodeId(wf.inputs[0], "new_id");

            expect(wf.connections).to.have.length(connectionsLen);
            expect(wf.nodes).to.have.length(nodesLen);
        });

        it("should change source for connected step.in", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            wf.changeIONodeId(wf.inputs[0], "new_id");

            expect(wf.steps[0].in[3].source).to.deep.equal(["#new_id"]);
        });

        it("should throw exception if id exists", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            expect(() => {
                wf.changeIONodeId(wf.inputs[0], wf.inputs[1].id);
            }).to.throw(`ID already exists on graph`);
        });

        it("should throw exception if id is invalid", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            expect(() => {
                wf.changeIONodeId(wf.inputs[0], "-char-problems!")
            }).to.throw(`illegal characters`);
        });

        it("should throw exception if id is blank", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            expect(() => {
                wf.changeIONodeId(wf.inputs[0], "")
            }).to.throw(`must be set`);
        });
    });

    describe("createInputFromPort", () => {
        let wf;

        beforeEach(() => {
            wf = WorkflowFactory.from(OneStepWf.default);
        });

        it("should add a new input to WorkflowModel", () => {
            const inputs = wf.inputs.length;
            wf.createInputFromPort(wf.steps[0].in[0]);

            expect(wf.inputs).to.have.length(inputs + 1);
        });

        it("should add a new node to graph", () => {
            const nodes = wf.nodes.length;
            wf.createInputFromPort(wf.steps[0].in[0]);

            expect(wf.nodes).to.have.length(nodes + 1);
        });

        it("should add a connection between port and input", () => {
            const conn = wf.connections.length;
            wf.createInputFromPort(wf.steps[0].in[0]);

            expect(wf.connections).to.have.length(conn + 1);
        });

        it("should set correct source on port", () => {
            const inPort = wf.steps[0].in[0];
            const input  = wf.createInputFromPort(inPort);

            expect(inPort.source).to.contain(input.sourceId);
        });

    });

    describe("createOutputFromPort", () => {
        let wf;

        beforeEach(() => {
            wf = WorkflowFactory.from(OneStepWf.default);
        });

        it("should add a new input to WorkflowModel", () => {
            const outputs = wf.outputs.length;
            wf.createOutputFromPort(wf.steps[0].out[0]);

            expect(wf.outputs).to.have.length(outputs + 1);
        });

        it("should add a new node to graph", () => {
            const nodes = wf.nodes.length;
            wf.createOutputFromPort(wf.steps[0].out[0]);

            expect(wf.nodes).to.have.length(nodes + 1);
        });

        it("should add a connection between port and input", () => {
            const conn = wf.connections.length;
            wf.createOutputFromPort(wf.steps[0].out[0]);

            expect(wf.connections).to.have.length(conn + 1);
        });

        it("should set correct source on port", () => {
            const inPort = wf.steps[0].out[0];
            const output = wf.createOutputFromPort(inPort);

            expect(output.source).to.contain(inPort.sourceId);
        });

    });

    describe("removeInput", () => {
        let wf;
        beforeEach(() => {
            wf = WorkflowFactory.from(TwoStepWf.default);
        });

        it("should remove the input from wf.inputs", () => {
            const inputs = wf.inputs.length;
            wf.removeInput(wf.inputs[0]);

            expect(wf.inputs).to.have.length(inputs - 1);
        });

        it("should remove node and connections", () => {
            const connections = wf.connections.length;
            const nodes = wf.nodes.length;
            wf.removeInput(wf.inputs[0]);

            expect(wf.connections).to.have.length(connections - 1);
            expect(wf.nodes).to.have.length(nodes - 1);
        });

        it("should remove source from step.in", () => {
            expect(wf.steps[0].in[0].source).to.contain(wf.inputs[0].sourceId);

            wf.removeInput(wf.inputs[0]);

            expect(wf.steps[0].in[0].source).to.be.empty;
        });
    });

    describe("removeOutput", () => {
        let wf;
        beforeEach(() => {
            wf = WorkflowFactory.from(TwoStepWf.default);
        });

        it("should remove the output from wf.outputs", () => {
            const outputs = wf.outputs.length;
            wf.removeOutput(wf.outputs[0]);

            expect(wf.outputs.length).to.equal(outputs -1);
        });

        it("should remove node and connections", () => {
            const connections = wf.connections.length;
            const nodes = wf.nodes.length;
            wf.removeOutput(wf.outputs[0]);

            expect(wf.connections).to.have.length(connections - 1);
            expect(wf.nodes).to.have.length(nodes - 1);
        });
    });
});