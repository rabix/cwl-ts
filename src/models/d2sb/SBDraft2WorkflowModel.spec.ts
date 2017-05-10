import {expect} from "chai";
import {WorkflowFactory} from "../generic/WorkflowFactory";
import * as OneStepWf from "../../tests/apps/one-step-wf-draf2";
import * as TwoStepWf from "../../tests/apps/two-step-wf-draft2";
import {WorkflowModel} from "../generic/WorkflowModel";


describe("SBDraft2WorkflowModel", () => {
    describe("exposePort", () => {
        it("should add a new input on the workflow and connect it to port", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);
            const connections = wf.connections.length;
            const inputs = wf.inputs.length;

            wf.exposePort(wf.steps[0].in[1]);

            expect(wf.inputs).to.have.length(inputs + 1);
            expect(wf.inputs[inputs].id).to.equal(wf.steps[0].in[1].id);
            expect(wf.connections).to.have.length(connections + 1);
        });

        it("should include in ports after being exposed", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);
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
            const wf = WorkflowFactory.from(OneStepWf.default);
            const inputs = wf.inputs.length;

            const inPort = wf.steps[0].in[3];
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
            const connections = wf.connections.length;

            wf.clearPort(wf.steps[0].in[3]);
            expect(wf.connections).to.have.length(connections - 1);
        });

        it("should remove connections with this port", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);

            const inPort = wf.steps[0].in[3];
            expect(inPort.isVisible).to.be.true;
            wf.clearPort(inPort);
            expect(inPort.isVisible).to.be.false;
        });

        it("should remove connected input on cleared port if input has no connection", () => {
            const wf = WorkflowFactory.from(OneStepWf.default);
            const inputs = wf.inputs.length;

            const inPort = wf.steps[0].in[3];
            expect(inPort.isVisible).to.be.true;
            expect(inPort.status).to.equal("port");

            wf.clearPort(inPort);
            expect(inPort.status).to.equal("editable");
            expect(wf.inputs).to.have.length(inputs - 1);
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

    describe("setBatch", () => {
        let wf: WorkflowModel;

        beforeEach(() => {
            wf = WorkflowFactory.from(OneStepWf.default);
        });

        it("should set batchByValue and batchInput to null if value is falsy or 'none'", () => {
            wf.setBatch("input1", undefined);
            expect(wf["batchByValue"]).to.be.null;
            expect(wf["batchInput"]).to.be.null;

            wf.setBatch("input2", "none");
            expect(wf["batchByValue"]).to.be.null;
            expect(wf["batchInput"]).to.be.null;
        });

        it("should set batchByValue and batchInput to string or array of strings", () => {

            const id1 = "input1";
            const value1 = "item";

            wf.setBatch(id1, value1);
            expect(wf["batchInput"]).to.equal(id1);
            expect(wf["batchByValue"]).to.equal(value1);

            const id2 = "input2";
            const value2 = ["value1", "value2"];

            wf.setBatch("input2", value2);
            expect(wf["batchInput"]).to.equal(id2);
            expect(wf["batchByValue"]).to.equal(value2);
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
                wf.changeIONodeId(wf.inputs[0], "-char-[problems!|]")
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
        let wf: WorkflowModel;

        beforeEach(() => {
            wf = WorkflowFactory.from(TwoStepWf.default);
        });

        it("should remove the input from wf.inputs by connectionId", () => {
            const inputs = wf.inputs.length;
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
        let wf: WorkflowModel;
        beforeEach(() => {
            wf = WorkflowFactory.from(TwoStepWf.default);
        });

        it("should remove the output from wf.outputs by connectionId", () => {
            const outputs = wf.outputs.length;
            const connections = wf.connections.length;
            const nodes = wf.nodes.length;

            wf.removeOutput(wf.outputs[0].connectionId);

            expect(wf.connections).to.have.length(connections - 1);
            expect(wf.nodes).to.have.length(nodes - 1);
            expect(wf.outputs.length).to.equal(outputs -1);
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

    describe("removeStep", () => {
        let wf: WorkflowModel;

        beforeEach(() => {
            wf = WorkflowFactory.from(TwoStepWf.default);
        });


        it("should remove step from wf.steps by connectionId", () => {
            const steps = wf.steps.length;
            const conn = wf.connections.length;
            const nodes = wf.nodes.length;

            wf.removeStep(wf.steps[0].connectionId);
            expect(wf.steps).to.have.length(steps - 1);

            expect(wf.connections).to.have.length(conn - 6);
            expect(wf.nodes).to.have.length(nodes - 3 /*ports on step*/ - 1 /*step*/ - 1 /*dangling input*/);

        });

        it("should remove step from wf.steps", () => {
            const steps = wf.steps.length;
            wf.removeStep(wf.steps[0]);
            expect(wf.steps).to.have.length(steps - 1);
        });

        it("should remove nodes and connections from graph", () => {
            const conn = wf.connections.length;
            const nodes = wf.nodes.length;

            wf.removeStep(wf.steps[0]);

            expect(wf.connections).to.have.length(conn - 6);
            expect(wf.nodes).to.have.length(nodes - 3 /*ports on step*/ - 1 /*step*/ - 1 /*dangling input*/);
        });

        it("should remove sources from outputs", () => {
            const step = wf.steps[1];
            const out = step.out[0].sourceId;

            expect(wf.outputs[0].source).to.contain(out);
            wf.removeStep(step);
            expect(wf.outputs[0].source).to.not.contain(out);
        });

        it("should remove sources from other steps", () => {
            const step = wf.steps[0];
            const out = step.out[0].sourceId;

            const target = wf.steps[1].in[0].source;

            expect(target).to.contain(out);
            wf.removeStep(step);
            expect(target).to.not.contain(out);
        });
    });

    describe("createInputFromPort", () => {
        let wf: WorkflowModel;

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

        it("should create an input from an output", () => {
            const output = wf.outputs[0];
            const input  = wf.createInputFromPort(output as any);

            expect(output.source).to.contain(input.sourceId);

        });

    });

    describe("createOutputFromPort", () => {
        let wf: WorkflowModel;

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
                wf.connect("in/io_tool/inFile", "in/io_tool_1/inFile")
            }).to.throw("source to be instanceof");
        });

        it("should throw an error if destination is not correct instance", () => {
            expect(() => {
                wf.connect("out/inFile/inFile", "out/io_tool_1/result")
            }).to.throw("destination to be instanceof");
        });

        it("should add source to destination", () => {
            const source      = wf.inputs[0];
            const destination = wf.steps[1].in[0];
            wf.connect(source, destination);

            expect(destination.source).to.contain(source.sourceId);
        });
    });

    describe("serialize", () => {
       it("should return the same basic workflow with all properties", () => {
            const data = {
                "class": "Workflow",
                "cwlVersion": "sbg:draft-2",
                "steps": [
                    {
                        "id": "#io_tool",
                        "run": {
                            "sbg:validationErrors": [],
                            "requirements": [
                                {
                                    "id": "#cwl-js-engine",
                                    "class": "ExpressionEngineRequirement",
                                    "requirements": [
                                        {
                                            "dockerPull": "rabix/js-engine",
                                            "class": "DockerRequirement"
                                        }
                                    ]
                                }
                            ],
                            "sbg:modifiedBy": "maya",
                            "sbg:project": "maya/test",
                            "stdout": "text.txt",
                            "hints": [
                                {
                                    "value": 1,
                                    "class": "sbg:CPURequirement"
                                },
                                {
                                    "value": 1000,
                                    "class": "sbg:MemRequirement"
                                },
                                {
                                    "dockerPull": "ubuntu",
                                    "class": "DockerRequirement"
                                }
                            ],
                            "successCodes": [],
                            "stdin": {
                                "script": "$job.inputs.inFile.path",
                                "engine": "#cwl-js-engine",
                                "class": "Expression"
                            },
                            "baseCommand": [
                                "grep"
                            ],
                            "sbg:revision": 1,
                            "label": "io-tool",
                            "sbg:createdBy": "maya",
                            "sbg:job": {
                                "allocatedResources": {
                                    "mem": 1000,
                                    "cpu": 1
                                },
                                "inputs": {
                                    "search": "search-string-value",
                                    "inFile": {
                                        "size": 0,
                                        "secondaryFiles": [],
                                        "class": "File",
                                        "path": "/path/to/inFile.ext"
                                    }
                                }
                            },
                            "id": "maya/test/io-tool/1",
                            "sbg:cmdPreview": "grep  < /path/to/inFile.ext > text.txt",
                            "sbg:sbgMaintained": false,
                            "sbg:contributors": [
                                "maya"
                            ],
                            "sbg:revisionsInfo": [
                                {
                                    "sbg:modifiedBy": "maya",
                                    "sbg:revision": 0,
                                    "sbg:revisionNotes": null,
                                    "sbg:modifiedOn": 1488448012
                                },
                                {
                                    "sbg:modifiedBy": "maya",
                                    "sbg:revision": 1,
                                    "sbg:revisionNotes": null,
                                    "sbg:modifiedOn": 1488448278
                                }
                            ],
                            "sbg:createdOn": 1488448012,
                            "cwlVersion": "sbg:draft-2",
                            "sbg:modifiedOn": 1488448278,
                            "sbg:id": "maya/test/io-tool/1",
                            "sbg:latestRevision": 1,
                            "sbg:image_url": null,
                            "inputs": [
                                {
                                    "id": "#search",
                                    "type": [
                                        "null",
                                        "string"
                                    ],
                                    "inputBinding": {
                                        "separate": true,
                                        "sbg:cmdInclude": true
                                    }
                                },
                                {
                                    "type": [
                                        "null",
                                        "File"
                                    ],
                                    "id": "#inFile",
                                    "required": false
                                }
                            ],
                            "outputs": [
                                {
                                    "type": [
                                        "null",
                                        "File"
                                    ],
                                    "outputBinding": {
                                        "glob": "*.txt"
                                    },
                                    "id": "#result"
                                }
                            ],
                            "temporaryFailCodes": [],
                            "class": "CommandLineTool",
                            "x": 450,
                            "y": 385
                        },
                        "inputs": [
                            {
                                "id": "#io_tool.inFile",
                                "source": [
                                    "#inFile"
                                ]
                            }
                        ],
                        "outputs": [
                            {
                                "id": "#io_tool.result"
                            }
                        ],
                        "label": "#io_tool",
                        "sbg:x": 450,
                        "sbg:y": 385
                    },
                    {
                        "id": "#io_tool_1",
                        "label": "#io_tool_1",
                        "run": {
                            "sbg:validationErrors": [],
                            "requirements": [
                                {
                                    "id": "#cwl-js-engine",
                                    "class": "ExpressionEngineRequirement",
                                    "requirements": [
                                        {
                                            "dockerPull": "rabix/js-engine",
                                            "class": "DockerRequirement"
                                        }
                                    ]
                                }
                            ],
                            "sbg:modifiedBy": "maya",
                            "sbg:project": "maya/test",
                            "stdout": "text.txt",
                            "hints": [
                                {
                                    "value": 1,
                                    "class": "sbg:CPURequirement"
                                },
                                {
                                    "value": 1000,
                                    "class": "sbg:MemRequirement"
                                },
                                {
                                    "dockerPull": "ubuntu",
                                    "class": "DockerRequirement"
                                }
                            ],
                            "successCodes": [],
                            "stdin": {
                                "script": "$job.inputs.inFile.path",
                                "engine": "#cwl-js-engine",
                                "class": "Expression"
                            },
                            "baseCommand": [
                                "grep"
                            ],
                            "sbg:revision": 1,
                            "label": "io-tool",
                            "sbg:createdBy": "maya",
                            "sbg:job": {
                                "allocatedResources": {
                                    "mem": 1000,
                                    "cpu": 1
                                },
                                "inputs": {
                                    "search": "search-string-value",
                                    "inFile": {
                                        "size": 0,
                                        "secondaryFiles": [],
                                        "class": "File",
                                        "path": "/path/to/inFile.ext"
                                    }
                                }
                            },
                            "id": "maya/test/io-tool/1",
                            "sbg:cmdPreview": "grep  < /path/to/inFile.ext > text.txt",
                            "sbg:sbgMaintained": false,
                            "sbg:contributors": [
                                "maya"
                            ],
                            "sbg:revisionsInfo": [
                                {
                                    "sbg:modifiedBy": "maya",
                                    "sbg:revision": 0,
                                    "sbg:revisionNotes": null,
                                    "sbg:modifiedOn": 1488448012
                                },
                                {
                                    "sbg:modifiedBy": "maya",
                                    "sbg:revision": 1,
                                    "sbg:revisionNotes": null,
                                    "sbg:modifiedOn": 1488448278
                                }
                            ],
                            "sbg:createdOn": 1488448012,
                            "cwlVersion": "sbg:draft-2",
                            "sbg:modifiedOn": 1488448278,
                            "sbg:id": "maya/test/io-tool/1",
                            "sbg:latestRevision": 1,
                            "sbg:image_url": null,
                            "inputs": [
                                {
                                    "id": "#search",
                                    "type": [
                                        "null",
                                        "string"
                                    ],
                                    "inputBinding": {
                                        "separate": true,
                                        "sbg:cmdInclude": true
                                    }
                                },
                                {
                                    "type": [
                                        "null",
                                        "File"
                                    ],
                                    "id": "#inFile",
                                    "required": false
                                }
                            ],
                            "outputs": [
                                {
                                    "type": [
                                        "null",
                                        "File"
                                    ],
                                    "outputBinding": {
                                        "glob": "*.txt"
                                    },
                                    "id": "#result"
                                }
                            ],
                            "temporaryFailCodes": [],
                            "class": "CommandLineTool",
                            "x": 793,
                            "y": 368
                        },
                        "inputs": [
                            {
                                "id": "#io_tool_1.inFile",
                                "source": [
                                    "#io_tool.result"
                                ]
                            }
                        ],
                        "outputs": [
                            {
                                "id": "#io_tool_1.result"
                            }
                        ],
                        "sbg:x": 793,
                        "sbg:y": 368
                    }
                ],
                "requirements": [],
                "inputs": [
                    {
                        "sbg:x": 117,
                        "label": "inFile",
                        "sbg:y": 346,
                        "type": [
                            "null",
                            "File"
                        ],
                        "id": "#inFile"
                    }
                ],
                "outputs": [
                    {
                        "sbg:y": 379,
                        "type": [
                            "null",
                            "File"
                        ],
                        "sbg:includeInPorts": true,
                        "sbg:x": 1070,
                        "id": "#result",
                        "label": "result",
                        "required": false,
                        "source": [
                            "#io_tool_1.result"
                        ]
                    }
                ],
                "sbg:validationErrors": [],
                "sbg:modifiedBy": "maya",
                "sbg:latestRevision": 1,
                "sbg:revision": 1,
                "sbg:revisionNotes": "two greps",
                "sbg:createdBy": "maya",
                "sbg:canvas_x": 0,
                "sbg:sbgMaintained": false,
                "sbg:contributors": [
                    "maya"
                ],
                "sbg:revisionsInfo": [
                    {
                        "sbg:modifiedBy": "maya",
                        "sbg:revision": 0,
                        "sbg:revisionNotes": null,
                        "sbg:modifiedOn": 1488447993
                    },
                    {
                        "sbg:modifiedBy": "maya",
                        "sbg:revision": 1,
                        "sbg:revisionNotes": "two greps",
                        "sbg:modifiedOn": 1488448331
                    }
                ],
                "sbg:createdOn": 1488447993,
                "sbg:id": "maya/test/two-step-wf/1",
                "sbg:canvas_zoom": 1,
                "sbg:projectName": "test",
                "sbg:image_url": "https://brood.sbgenomics.com/static/maya/test/two-step-wf/1.png",
                "sbg:canvas_y": 0,
                "sbg:modifiedOn": 1488448331,
                "sbg:project": "maya/test",
                "id": "maya/test/two-step-wf/1",
                "label": "two-step-wf",
                "hints": [],
                "sbg:batchBy": {
                    type: "criteria",
                    criteria: ["value1"]
                },
                "sbg:batchInput": "#testId"
            };
            const wf = WorkflowFactory.from(data as any);

            expect(wf.serialize()).to.deep.equal(data);
       });
    });
});