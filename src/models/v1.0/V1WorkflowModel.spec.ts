import {expect} from "chai";
import * as OneStepWf from "../../tests/apps/one-step-wf";
import * as TwoStepWf from "../../tests/apps/first-workflow";
import {WorkflowFactory} from "../generic/WorkflowFactory";
import {WorkflowModel} from "../generic/WorkflowModel";
import {V1WorkflowModel} from "./V1WorkflowModel";
import {Workflow} from "../../mappings/v1.0/Workflow";

describe("V1WorkflowModel", () => {
    describe("exposePort", () => {
        it("should add a new input on the workflow and connect it to port", () => {
            const wf          = WorkflowFactory.from(OneStepWf.default);
            const connections = wf.connections.length;
            const inputs      = wf.inputs.length;

            wf.exposePort(wf.steps[0].in[1]);

            expect(wf.inputs).to.have.length(inputs + 1);
            expect(wf.inputs[inputs].id).to.equal(wf.steps[0].in[1].id);
            expect(wf.connections).to.have.length(connections + 1);
        });

        it("should include in ports after being exposed", () => {
            const wf     = WorkflowFactory.from(OneStepWf.default);
            const inputs = wf.inputs.length;

            const inPort = wf.steps[0].in[1];
            wf.exposePort(inPort);
            expect(wf.inputs).to.have.length(inputs + 1);
            expect(inPort.isVisible).to.be.false;
            expect(inPort.status).to.equal("exposed");

            wf.includePort(inPort);
            expect(wf.inputs).to.have.length(inputs);
            expect(inPort.isVisible).to.be.true;
            expect(inPort.status).to.equal("port");


            wf.exposePort(inPort);
            expect(wf.inputs).to.have.length(inputs + 1);
            expect(inPort.isVisible).to.be.false;
            expect(inPort.status).to.equal("exposed");

        });

        it("should expose connected port", () => {
            const wf     = WorkflowFactory.from(OneStepWf.default);
            const inputs = wf.inputs.length;

            const inPort = wf.steps[0].in[0];
            expect(inPort.isVisible).to.be.true;
            expect(inPort.status).to.equal("port");

            wf.exposePort(inPort);
            expect(wf.inputs).to.have.length(inputs); // will replace input that existed with new input
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
            const nodesLen       = wf.nodes.length;

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

            expect(wf.steps[0].in[0].source).to.deep.equal(["new_id"]);
        });

        it("should throw exception if id exists", () => {
            const wf = WorkflowFactory.from(TwoStepWf.default);

            expect(() => {
                wf.changeIONodeId(wf.inputs[0], wf.inputs[1].id)
            }).to.throw(`ID already exists on graph`);
        });

        it("should throw exception if id is invalid", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            expect(() => {
                wf.changeIONodeId(wf.inputs[0], "-char-problems!|")
            }).to.throw(`invalid`);
        });

        it("should throw exception if id is blank", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            expect(() => {
                wf.changeIONodeId(wf.inputs[0], "")
            }).to.throw(`must be set`);
        });
    });

    describe("removeInput", () => {
        let wf;
        beforeEach(() => {
            wf = WorkflowFactory.from(TwoStepWf.default);
        });

        it("should remove the input from wf.inputs by connectionId", () => {
            const inputs      = wf.inputs.length;
            const connections = wf.connections.length;
            expect(wf.steps[0].in[0].source).to.contain(wf.inputs[0].sourceId);

            const nodes = wf.nodes.length;
            wf.removeInput(wf.inputs[0].connectionId);

            expect(wf.inputs).to.have.length(inputs - 1);
            expect(wf.connections).to.have.length(connections - 1);
            expect(wf.nodes).to.have.length(nodes - 1);
            expect(wf.steps[0].in[0].source).to.be.empty;

        });

        it("should remove the input from wf.inputs", () => {
            const inputs = wf.inputs.length;
            wf.removeInput(wf.inputs[0]);

            expect(wf.inputs).to.have.length(inputs - 1);
        });

        it("should remove node and connections", () => {
            const connections = wf.connections.length;
            const nodes       = wf.nodes.length;
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

        it("should remove the output from wf.outputs by connectionId", () => {
            const outputs     = wf.outputs.length;
            const connections = wf.connections.length;
            const nodes       = wf.nodes.length;

            wf.removeOutput(wf.outputs[0].connectionId);

            expect(wf.connections).to.have.length(connections - 1);
            expect(wf.nodes).to.have.length(nodes - 1);
            expect(wf.outputs.length).to.equal(outputs - 1);
        });

        it("should remove the output from wf.outputs", () => {
            const outputs = wf.outputs.length;
            wf.removeOutput(wf.outputs[0]);

            expect(wf.outputs.length).to.equal(outputs - 1);
        });

        it("should remove node and connections", () => {
            const connections = wf.connections.length;
            const nodes       = wf.nodes.length;
            wf.removeOutput(wf.outputs[0]);

            expect(wf.connections).to.have.length(connections - 1);
            expect(wf.nodes).to.have.length(nodes - 1);
        });
    });

    describe("removeStep", () => {
        let wf: WorkflowModel;
        beforeEach(() => {
            wf = WorkflowFactory.from(TwoStepWf.default);
        });

        it("should remove step from wf.steps by connectionId", () => {
            const steps = wf.steps.length;
            const conn  = wf.connections.length;
            const nodes = wf.nodes.length;

            wf.removeStep(wf.steps[0].connectionId);
            expect(wf.steps).to.have.length(steps - 1);

            expect(wf.connections).to.have.length(conn - 7, "connections");
            expect(wf.nodes).to.have.length(nodes - 6, "nodes");

        });

        it("should remove step from wf.steps", () => {
            const steps = wf.steps.length;
            wf.removeStep(wf.steps[0]);
            expect(wf.steps).to.have.length(steps - 1);
        });

        it("should remove nodes and connections from graph", () => {
            const conn  = wf.connections.length;
            const nodes = wf.nodes.length;

            wf.removeStep(wf.steps[0]);

            expect(wf.connections).to.have.length(conn - 7, "connections");
            expect(wf.nodes).to.have.length(nodes - 6, "nodes");
        });

        it("should remove sources from outputs", () => {
            const step = wf.steps[1];
            const out  = step.out[0].sourceId;

            expect(wf.outputs[0].source).to.contain(out);
            wf.removeStep(step);
            expect(wf.outputs[0].source).to.not.contain(out);
        });

        it("should remove sources from other steps", () => {
            const step = wf.steps[0];
            const out  = step.out[0].sourceId;

            const target = wf.steps[1].in[0].source;

            expect(target).to.contain(out);
            wf.removeStep(step);
            expect(target).to.not.contain(out);
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

        it("should add an input without a conflicting id", () => {
            const inputs = wf.inputs.length;
            wf.createInputFromPort(wf.steps[0].in[0]);
            wf.createInputFromPort(wf.steps[0].in[0]);
            wf.createInputFromPort(wf.steps[0].in[0]);

            expect(wf.inputs).to.have.length(inputs + 3);
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
        let wf: WorkflowModel;

        beforeEach(() => {
            wf = WorkflowFactory.from(OneStepWf.default);
        });

        it("should add a new output to WorkflowModel", () => {
            const outputs = wf.outputs.length;
            wf.createOutputFromPort(wf.steps[0].out[0]);

            expect(wf.outputs).to.have.length(outputs + 1);
        });

        it("should add an output without a conflicting id", () => {
            const outputs = wf.outputs.length;
            wf.createOutputFromPort(wf.steps[0].out[0]);
            wf.createOutputFromPort(wf.steps[0].out[0]);
            wf.createOutputFromPort(wf.steps[0].out[0]);

            expect(wf.outputs).to.have.length(outputs + 3);
        });

        it("should add a new node to graph", () => {
            const nodes = wf.nodes.length;
            wf.createOutputFromPort(wf.steps[0].out[0]);

            expect(wf.nodes).to.have.length(nodes + 1);
        });

        it("should add a connection between port and output", () => {
            const conn = wf.connections.length;
            wf.createOutputFromPort(wf.steps[0].out[0]);

            expect(wf.connections).to.have.length(conn + 1);
        });

        it("should set correct source on port", () => {
            const outPort = wf.steps[0].out[0];
            const output  = wf.createOutputFromPort(outPort);

            expect(output.source).to.contain(outPort.sourceId);
        });

    });

    describe("connect", () => {
        let wf: WorkflowModel;
        beforeEach(() => {
            wf = WorkflowFactory.from(TwoStepWf.default);
        });

        it("should add a new connection to the graph", () => {
            const connections = wf.connections.length;
            wf.connect(wf.inputs[0], wf.steps[1].in[0]);
            expect(wf.connections).to.have.length(connections + 1);
        });

        it("should throw an error if source is not correct instance", () => {
            expect(() => {
                wf.connect("in/compile/src", "in/untar/tarfile")
            }).to.throw("source to be instanceof");
        });

        it("should throw an error if destination is not correct instance", () => {
            expect(() => {
                wf.connect("out/inp/inp", "out/untar/example_out")
            }).to.throw("destination to be instanceof");
        });

        it("should add source to destination", () => {
            const source      = wf.inputs[0];
            const destination = wf.steps[1].in[0];
            wf.connect(source, destination);

            expect(destination.source).to.contain(source.sourceId);
        });
    });

    describe("disconnect", () => {
        let wf: WorkflowModel;
        beforeEach(() => {
            wf = WorkflowFactory.from(TwoStepWf.default);
        });

        it("should remove an existing connection between two nodes", () => {
            const connections = wf.connections.length;
            const con         = wf.connections.filter(c => c.isVisible)[0];

            wf.disconnect(con.source.id, con.destination.id);

            expect(wf.connections.length).to.equal(connections - 1);
        });

        it("should throw an error if trying to remove connection between step and port", () => {
            expect(() => {
                const con = wf.connections[0];
                wf.disconnect(con.source.id, con.destination.id);
            }).to.throw("instanceof ")
        });

        it("should remove source on destination for removed connection", () => {
            const con  = wf.connections.filter(c => c.isVisible)[0];
            const dest = wf.findById(con.destination.id);
            const src  = wf.findById(con.source.id);

            expect(dest.source).to.contain(src.sourceId);
            wf.disconnect(con.source.id, con.destination.id);
            expect(dest.source).to.not.contain(src.sourceId);
        });

        it("should remove input if it is left dangling", () => {
            const inputs = wf.inputs.length;
            wf.disconnect("out/inp/inp", "in/untar/tarfile");
            expect(wf.inputs).to.have.length(inputs - 1);
        });

        it("should remove output if it is left dangling", () => {
            const outputs = wf.outputs.length;
            wf.disconnect("out/compile/classfile", "in/classout/classout");
            expect(wf.outputs).to.have.length(outputs - 1);
        });

        it("should not remove io that isn't dangling", () => {
            const outputs = wf.outputs.length;
            wf.disconnect("out/compile/some_file", "in/other_output/other_output");
            expect(wf.outputs).to.have.length(outputs);
        });

        it("should throw an exception if connection doesn't exist", () => {
            expect(() => {
                wf.disconnect(wf.inputs[0].connectionId, wf.outputs[0].connectionId);
            }).to.throw("nonexistent connection");
        })
    });

    describe("serialize", () => {
        let wf: V1WorkflowModel;
        let serialize: Workflow;
        beforeEach(() => {
            wf        = <V1WorkflowModel> WorkflowFactory.from(OneStepWf.default);
            serialize = wf.serialize();
        });

        it("should serialize class and version", () => {
            expect(serialize).to.haveOwnProperty("cwlVersion");
            expect(serialize.cwlVersion).to.equal("v1.0");

            expect(serialize).to.haveOwnProperty("class");
            expect(serialize.class).to.equal("Workflow");
        });

        it("should serialize inputs array", () => {
            expect(serialize).to.haveOwnProperty("inputs");
            expect(serialize.inputs).to.have.length(1);
        });

        it("should serialize outputs array", () => {
            expect(serialize).to.haveOwnProperty("outputs");
            expect(serialize.outputs).to.have.length(1);
        });

        it("should serialize steps array", () => {
            expect(serialize).to.haveOwnProperty("steps");
            expect(serialize.steps).to.have.length(1);
        });
    });

    describe("has cycles", () => {
        it.only("should recognize cycle in output", (done) => {
            const wf = new V1WorkflowModel({
                class: "Workflow",
                cwlVersion: "v1.0",
                inputs: [
                    {
                        id: "input",
                        type: "string"
                    }
                ],
                outputs: [
                    {
                        id: "output",
                        outputSource: "output"
                    }
                ],
                steps: [
                    {
                        id: "step",
                        run: "/path/to/",
                        in: [],
                        out: []
                    }
                ]
            });


            wf.validate().then(() => {
                expect(wf.errors.length).to.equal(1);
                done();
            }).catch(done);
        });
    });
});