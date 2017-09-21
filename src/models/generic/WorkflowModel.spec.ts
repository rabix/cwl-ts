import {expect} from "chai";
import {WorkflowFactory} from "./WorkflowFactory";
import * as FirstWF from "../../tests/apps/first-workflow";
import * as TypelessFirstWF from "../../tests/apps/typeless-first-workflow";
import * as EmbeddedFirstWF from "../../tests/apps/embedded-first-wf";
import * as EmbeddedFileTypeFirstWF from "../../tests/apps/embedded-filetype-first-wf";
import * as DisconnectedFirstWF from "../../tests/apps/disconnected-first-workflow";
import * as CyclicalWF from "../../tests/apps/cyclical-first-wf";
import * as OneStepWF from "../../tests/apps/one-step-wf";
import * as ModelForValidation from "../../tests/apps/workflow-for-validating-connections";
import * as ValidationErrors from "../../tests/apps/valid-connection-for-workflow";
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

    describe("removeOutput", () => {

        it("should remove output port (connected only with inputs) from graph and dangling input ports", () => {

            const wf = WorkflowFactory.from(ModelForValidation.default);

            const outputPortToRemove = wf.outputs.find(i => i.id === "outputPortToRemove");

            const danglingInputPort1 = wf.inputs.find(i => i.id === "danglingInputPort1");
            const danglingInputPort2 = wf.inputs.find(i => i.id === "danglingInputPort2");

            expect(outputPortToRemove.warnings.length).to.equal(2);

            wf.removeOutput(outputPortToRemove);

            const connection = wf.connections
                .find((c) => c.destination.id === outputPortToRemove.connectionId);

            expect(outputPortToRemove.warnings.length).to.equal(0);

            expect(connection, "Connection should not be in the graph anymore!").to.be.undefined;

            expect(wf.findById(outputPortToRemove.connectionId), "Output port should not be in the graph anymore!").to.be.undefined;
            expect(wf.findById(danglingInputPort1.connectionId), "Dangling input port 1 should not be in the graph anymore!").to.be.undefined;
            expect(wf.findById(danglingInputPort2.connectionId), "Dangling input port 1 should not be in the graph anymore!").to.be.undefined;

        });

        it("should remove output port (connected with step) from graph", () => {

            const wf = WorkflowFactory.from(ModelForValidation.default);
            const outputToRemove = wf.outputs.find(i => i.id === "outputPortString");

            expect(outputToRemove.warnings.length).to.equal(5);

            wf.removeOutput(outputToRemove);

            const connection = wf.connections.find((c) => c.destination.id === outputToRemove.connectionId);

            expect(outputToRemove.warnings.length).to.equal(0);
            expect(connection, "Connection should not be in the graph anymore!").to.be.undefined;
            expect(wf.findById(outputToRemove.connectionId), "Output port should not be in the graph anymore!").to.be.undefined;
        });

    });

    describe("removeInput", () => {

        it("should remove input port (connected only with outputs) from graph and dangling outputs also", () => {
            const wf = WorkflowFactory.from(ModelForValidation.default);

            const inputToRemove = wf.inputs.find(i => i.id === "inputPortToRemove");

            const danglingOutput1 = wf.outputs.find(i => i.id === "danglingOutputPort1");
            const danglingOutput2 = wf.outputs.find(i => i.id === "danglingOutputPort2");

            expect(danglingOutput1.warnings.length).to.equal(1);
            expect(danglingOutput2.warnings.length).to.equal(1);

            wf.removeInput(inputToRemove);

            expect(danglingOutput1.warnings.length).to.equal(0);
            expect(danglingOutput2.warnings.length).to.equal(0);

            expect(wf.findById(inputToRemove.connectionId), "Input port should not be in the graph anymore!").to.be.undefined;
            expect(wf.findById(danglingOutput1.connectionId), "Dangling output port 1 should not be in the graph anymore!").to.be.undefined;
            expect(wf.findById(danglingOutput2.connectionId), "Dangling output port 2 should not be in the graph anymore!").to.be.undefined;
        });

        it("should remove input port (connected with step) from graph", () => {
            const wf = WorkflowFactory.from(ModelForValidation.default);

            const step = wf.steps.find(step => step.id === "tool_step");

            const inputToRemove = wf.inputs.find(i => i.id === "inputPortString");

            // Step inputs that are connected to Input port
            const stepInputString = step.in.find(i => i.id === "stepInputString");
            const stepInputFileTypesABC = step.in.find(i => i.id === "stepInputFileTypesABC");
            const stepInputFileTypesA = step.in.find(i => i.id === "stepInputFileTypesA");
            const stepInputFile = step.in.find(i => i.id === "stepInputFile");
            const stepInputArrayString = step.in.find(i => i.id === "stepInputArrayString");
            const stepInputArrayFile = step.in.find(i => i.id === "stepInputArrayFile");

            // Warnings on step input ports before removing the input
            const stepInputStringWarningsBefore = stepInputString.warnings.length;
            const stepInputFileTypesABCWarningsBefore = stepInputFileTypesABC.warnings.length;
            const stepInputFileTypesAWarningsBefore = stepInputFileTypesA.warnings.length;
            const stepInputFileWarningsBefore = stepInputFile.warnings.length;
            const stepInputArrayStringWarningsBefore = stepInputArrayString.warnings.length;
            const stepInputArrayFileWarningsBefore = stepInputArrayFile.warnings.length;

            wf.removeInput(inputToRemove);

            // Warnings on step input ports after removing the input
            const stepInputStringWarningsAfter = stepInputString.warnings.length;
            const stepInputFileTypesABCWarningsAfter = stepInputFileTypesABC.warnings.length;
            const stepInputFileTypesAWarningsAfter = stepInputFileTypesA.warnings.length;
            const stepInputFileWarningsAfter = stepInputFile.warnings.length;
            const stepInputArrayStringWarningsAfter = stepInputArrayString.warnings.length;
            const stepInputArrayFileWarningsAfter = stepInputArrayFile.warnings.length;

            expect(stepInputStringWarningsBefore - stepInputStringWarningsAfter).equal(0);
            expect(stepInputFileTypesABCWarningsBefore - stepInputFileTypesABCWarningsAfter).equal(1);
            expect(stepInputFileTypesAWarningsBefore - stepInputFileTypesAWarningsAfter).equal(1);
            expect(stepInputFileWarningsBefore - stepInputFileWarningsAfter).equal(1);
            expect(stepInputArrayStringWarningsBefore - stepInputArrayStringWarningsAfter).equal(0);
            expect(stepInputArrayFileWarningsBefore - stepInputArrayFileWarningsAfter).equal(1);
        });

    });

    describe("connect", () => {

        it("should throw an error if source or destination are not defined", () => {
            const wf = WorkflowFactory.from(ModelForValidation.default);

            expect(() => wf.connect(undefined, undefined))
                .to.throw("Source and destination must be defined");

            expect(() => wf.connect(undefined, "some"))
                .to.throw("Source and destination must be defined");

            expect(() => wf.connect("source", undefined))
                .to.throw("Source and destination must be defined");
        });

        it("should throw an error if source and destination belongs to same port", () => {
            const wf = WorkflowFactory.from(ModelForValidation.default);

            const step = wf.steps.find((step) => step.id === "tool_step");

            const source = step.in.find((input) => input.id === "stepInputString");
            const destination = step.out.find((output) => output.id === "stepOutputString");

            expect(() => wf.connect(destination, source))
                .to.throw("Cannot connect ports that belong to the same step: tool_step");
        });


        it("should make valid connection between step and output", () => {
            const wf = WorkflowFactory.from(ModelForValidation.default);

            const step = wf.steps.find((step) => step.id === "tool_step");

            const source = step.out.find((output) => output.id === "stepOutputString");
            const destination = wf.outputs.find((input) => input.id === "outputPortValidConnection");

            expect(wf.connect(source, destination)).equal(true);
            expect(destination.warnings.length).equal(0);
            const connection = wf.connections
                .find((con) => con.source.id === source.connectionId && con.destination.id === destination.connectionId);

            expect(connection.isValid).equal(true);
        });

        it("should make invalid connection between step and output", () => {
            const wf = WorkflowFactory.from(ModelForValidation.default);

            const step = wf.steps.find((step) => step.id === "tool_step");

            const source = step.out.find((output) => output.id === "stepOutputString");
            const destination = wf.outputs.find((input) => input.id === "outputPortInvalidConnection");

            expect(wf.connect(source, destination)).equal(false);
            expect(destination.warnings.length).equal(1);

            const connection = wf.connections
                .find((con) => con.source.id === source.connectionId && con.destination.id === destination.connectionId);
            expect(connection.isValid).equal(false);
        });


        it("should make valid connection between input and step", () => {
            const wf = WorkflowFactory.from(ModelForValidation.default);

            const step = wf.steps.find((step) => step.id === "tool_step");

            const source = wf.inputs.find((input) => input.id === "inputPortValidConnection");
            const destination = step.in.find((output) => output.id === "stepInputString");

            const warningsBeforeConnection = destination.warnings.length;

            expect(wf.connect(source, destination)).equal(true);

            const warningsAfterConnection = destination.warnings.length;

            expect(warningsBeforeConnection - warningsAfterConnection).equal(0);

            const connection = wf.connections
                .find((con) => con.source.id === source.connectionId && con.destination.id === destination.connectionId);
            expect(connection.isValid).equal(true);
        });

        it("should make invalid connection between input and step", () => {
            const wf = WorkflowFactory.from(ModelForValidation.default);

            const step = wf.steps.find((step) => step.id === "tool_step");

            const source = wf.inputs.find((input) => input.id === "inputPortInvalidConnection");
            const destination = step.in.find((output) => output.id === "stepInputString");

            const warningsBeforeConnection = destination.warnings.length;
            expect(wf.connect(source, destination)).equal(false);
            const warningsAfterConnection = destination.warnings.length;
            expect(warningsAfterConnection - warningsBeforeConnection).equal(1);

            expect(destination.warnings.length).equal(6);

            const connection = wf.connections
                .find((con) => con.source.id === source.connectionId && con.destination.id === destination.connectionId);
            expect(connection.isValid).equal(false);
        });

        it("should make valid connection between input and output", () => {
            const wf = WorkflowFactory.from(ModelForValidation.default);

            const source = wf.inputs.find((input) => input.id === "inputPortValidConnection");
            const destination = wf.outputs.find((input) => input.id === "outputPortValidConnection");

            expect(wf.connect(source, destination)).equal(true);
            expect(destination.warnings.length).equal(0);

            const connection = wf.connections
                .find((con) => con.source.id === source.connectionId && con.destination.id === destination.connectionId);
            expect(connection.isValid).equal(true);
        });

        it("should make invalid connection between input and output", () => {
            const wf = WorkflowFactory.from(ModelForValidation.default);

            const source = wf.inputs.find((input) => input.id === "inputPortValidConnection");
            const destination = wf.outputs.find((output) => output.id === "outputPortInvalidConnection");


            expect(wf.connect(source, destination)).equal(false);
            expect(destination.warnings.length).equal(1);

            const connection = wf.connections
                .find((con) => con.source.id === source.connectionId && con.destination.id === destination.connectionId);
            expect(connection.isValid).equal(false);
        });

    });

    describe("disconnect", () => {

        it("should throw an error if source or destination are not defined", () => {
            const wf = WorkflowFactory.from(ModelForValidation.default);

            expect(() => wf.disconnect(undefined, undefined))
                .to.throw("Source and destination must be defined");
            expect(() => wf.disconnect(undefined, "some"))
                .to.throw("Source and destination must be defined");
            expect(() => wf.disconnect("source", undefined))
                .to.throw("Source and destination must be defined");
        });

        it("should throw an error if there is no connection between source and destination", () => {
            const wf = WorkflowFactory.from(ModelForValidation.default);

            const source = wf.inputs.find((input) => input.id === "inputPortValidConnection");
            const destination = wf.outputs.find((output) => output.id === "outputPortInvalidConnection");

            expect(() => wf.disconnect(source, destination))
                .to.throw(`Could not remove nonexistent connection between ${source.connectionId} and ${destination.connectionId}`);
        });

        it("should disconnect and remove dangling input", () => {
            const wf = WorkflowFactory.from(ModelForValidation.default);

            const source = wf.inputs.find((input) => input.id === "danglingInputPort1");
            const destination = wf.outputs.find((output) => output.id === "outputPortToRemove");

            wf.disconnect(source, destination);

            expect(wf.findById(source.connectionId), "Input port should not be in the graph anymore!").to.be.undefined;

            const connection = wf.connections
                .find((con) => con.source.id === source.connectionId && con.destination.id === destination.connectionId);
            expect(connection, "Connection should not be in the graph anymore!").to.be.undefined;
        });

        it("should disconnect and remove dangling output", () => {
            const wf = WorkflowFactory.from(ModelForValidation.default);

            const source = wf.inputs.find((input) => input.id === "inputPortToRemove");
            const destination = wf.outputs.find((output) => output.id === "danglingOutputPort1");

            wf.disconnect(source, destination);

            expect(wf.findById(destination.connectionId), "Output port should not be in the graph anymore!").to.be.undefined;
            expect(destination.warnings.length).equal(0);

            const connection = wf.connections
                .find((con) => con.source.id === source.connectionId && con.destination.id === destination.connectionId);
            expect(connection, "Connection should not be in the graph anymore!").to.be.undefined;
        });

        it("should disconnect and validate output destination", () => {
            const wf = WorkflowFactory.from(ModelForValidation.default);

            const source = wf.inputs.find((input) => input.id === "danglingInputPort2");
            const destination = wf.outputs.find((output) => output.id === "outputPortToRemove");

            const warningBeforeDisconnect = destination.warnings.length;

            wf.disconnect(source, destination);

            const warningsAfterDisconnect = destination.warnings.length;

            expect(warningBeforeDisconnect - warningsAfterDisconnect).equal(1);

            const connection = wf.connections
                .find((con) => con.source.id === source.connectionId && con.destination.id === destination.connectionId);
            expect(connection, "Connection should not be in the graph anymore!").to.be.undefined;
        });

        it("should disconnect valid connection and validate step destination", () => {
            const wf = WorkflowFactory.from(ModelForValidation.default);

            const source = wf.inputs.find((input) => input.id === "inputPortString");
            const destination = wf.steps.find((output) => output.id === "tool_step")
                .in.find((i) => i.id === "stepInputString");

            const warningBeforeDisconnect = destination.warnings.length;

            wf.disconnect(source, destination);

            const warningsAfterDisconnect = destination.warnings.length;

            expect(warningBeforeDisconnect - warningsAfterDisconnect).equal(0);

            const connection = wf.connections
                .find((con) => con.source.id === source.connectionId && con.destination.id === destination.connectionId);
            expect(connection, "Connection should not be in the graph anymore!").to.be.undefined;
        });

        it("should disconnect invalid connection and validate step destination", () => {
            const wf = WorkflowFactory.from(ModelForValidation.default);
            const source = wf.inputs.find((input) => input.id === "inputPortFileTypesA");
            const destination = wf.steps.find((output) => output.id === "tool_step")
                .in.find((i) => i.id === "stepInputString");

            const warningBeforeDisconnect = destination.warnings.length;

            wf.disconnect(source, destination);

            const warningsAfterDisconnect = destination.warnings.length;

            expect(warningBeforeDisconnect - warningsAfterDisconnect).equal(1);

            const connection = wf.connections
                .find((con) => con.source.id === source.connectionId && con.destination.id === destination.connectionId);
            expect(connection, "Connection should not be in the graph anymore!").to.be.undefined;
        });

    });

    describe("gatherValidConnectionPoints", () => {
        it("should return all sources if workflow defines no types", () => {
            const wf = WorkflowFactory.from(TypelessFirstWF.default);
            const validSources = wf.gatherValidConnectionPoints(wf.steps[0].in[0]);

            expect(validSources).to.not.be.empty;
            expect(validSources).to.have.length(4);
        });

        it("should return only sources of the same type", () => {
            const wf = WorkflowFactory.from(EmbeddedFirstWF.default);
            // destination with type File
            const validSourcesFile = wf.gatherValidConnectionPoints(wf.steps[0].in[0]);

            expect(validSourcesFile).to.not.be.empty;
            expect(validSourcesFile).to.have.length(2);
            expect(validSourcesFile[0].type.type).to.equal("File");
            expect(validSourcesFile[1].type.type).to.equal("array");
            expect(validSourcesFile[1].type.items).to.equal("File");

            // destination with type string
            const validSourcesString = wf.gatherValidConnectionPoints(wf.steps[0].in[1]);
            expect(validSourcesString).to.not.be.empty;
            expect(validSourcesString).to.have.length(1);
            expect(validSourcesString[0].type.type).to.equal("string");
            expect(validSourcesString[0]).instanceof(WorkflowInputParameterModel);
        });

        it("should return only sources with same fileTypes if destination is File", () => {
            const wf = WorkflowFactory.from(EmbeddedFileTypeFirstWF.default);
            const validSourcesFile = wf.gatherValidConnectionPoints(wf.steps[0].in[0]);

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
            expect(destinations).to.have.length(5)
        });
    });

    describe("constructGraph", () => {
        it("should construct a graph with appropriate number of edges and vertices", () => {
            const wf = WorkflowFactory.from(FirstWF.default);
            const g = wf.constructGraph();

            console.log("graph edges", Array.from(g.edges));
            expect(g.edges.size).to.equal(12);

            expect(g.vertices.size).to.equal(12);
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
    });

    describe("validateConnectionsForIOPort", () => {
        it("should validate all connections made with Output port", () => {

            const wf = WorkflowFactory.from(ModelForValidation.default);

            const output = wf.outputs.find((output) => output.id === "outputPortString");

            const outputWarningsBefore = output.warnings.length;
            const connectionsBefore = wf.connections.filter((c) => c.destination.id === output.connectionId);
            const validConnectionsBeforeCleaning = connectionsBefore.filter((c) => c.isValid);

            output.cleanValidity();
            wf.validateConnectionsForIOPort(output);

            const outputWarningsAfter = output.warnings.length;
            const connectionsAfter = wf.connections.filter((c) => c.destination.id === output.connectionId);
            const validConnectionsAfter = connectionsAfter.filter((c) => c.isValid);

            expect(outputWarningsBefore).equal(outputWarningsAfter);
            expect(connectionsBefore.length).equal(connectionsAfter.length);
            expect(validConnectionsBeforeCleaning.length).equal(validConnectionsAfter.length);
        });

        it("should validate all connections made with Input port", () => {

            const wf = WorkflowFactory.from(ModelForValidation.default);

            const input = wf.inputs.find((output) => output.id === "inputPortString");
            const step = wf.steps.find(step => step.id === "tool_step");

            // Step inputs that are connected to Input port
            const stepInputString = step.in.find(i => i.id === "stepInputString");
            const stepInputFileTypesABC = step.in.find(i => i.id === "stepInputFileTypesABC");
            const stepInputFileTypesA = step.in.find(i => i.id === "stepInputFileTypesA");
            const stepInputFile = step.in.find(i => i.id === "stepInputFile");
            const stepInputArrayString = step.in.find(i => i.id === "stepInputArrayString");
            const stepInputArrayFile = step.in.find(i => i.id === "stepInputArrayFile");

            // Warnings on step input ports before cleaning validation
            const stepInputStringWarningsBefore = stepInputString.warnings.length;
            const stepInputFileTypesABCWarningsBefore = stepInputFileTypesABC.warnings.length;
            const stepInputFileTypesAWarningsBefore = stepInputFileTypesA.warnings.length;
            const stepInputFileWarningsBefore = stepInputFile.warnings.length;
            const stepInputArrayStringWarningsBefore = stepInputArrayString.warnings.length;
            const stepInputArrayFileWarningsBefore = stepInputArrayFile.warnings.length;

            input.cleanValidity();
            wf.validateConnectionsForIOPort(input);

            // Warnings on step input ports after removing the input
            const stepInputStrinsWarningsAfter = stepInputString.warnings.length;
            const stepInputFileTypesABCWarningsAfter = stepInputFileTypesABC.warnings.length;
            const stepInputFileTypesAWarningsAfter = stepInputFileTypesA.warnings.length;
            const stepInputFileWarningsAfter = stepInputFile.warnings.length;
            const stepInputArrayStringWarningsAfter = stepInputArrayString.warnings.length;
            const stepInputArrayFileWarningsAfter = stepInputArrayFile.warnings.length;

            expect(stepInputStringWarningsBefore - stepInputStrinsWarningsAfter).equal(0);
            expect(stepInputFileTypesABCWarningsBefore - stepInputFileTypesABCWarningsAfter).equal(0);
            expect(stepInputFileTypesAWarningsBefore - stepInputFileTypesAWarningsAfter).equal(0);
            expect(stepInputFileWarningsBefore - stepInputFileWarningsAfter).equal(0);
            expect(stepInputArrayStringWarningsBefore - stepInputArrayStringWarningsAfter).equal(0);
            expect(stepInputArrayFileWarningsBefore - stepInputArrayFileWarningsAfter).equal(0);
        });

    });


    describe("validate", () => {
        it("should validate workflow connections on initialization and when you call validate() method", async (done) => {

            const listOfValidConnections = ValidationErrors.default;

            const wf = WorkflowFactory.from(ModelForValidation.default);

            const check = () => {
                wf.connections.forEach((c) => {

                    const connectionFound = listOfValidConnections.find(connection =>
                        (c.source.id === connection.source.id) && (c.destination.id === connection.destination.id));

                    if (connectionFound) {
                        expect(c.isValid).equal(true);
                    } else {
                        // If invalid then should have warnings
                        expect(wf.findById(c.destination.id).warnings.length).greaterThan(0);
                        expect(c.isValid).equal(false);
                    }

                });
            };

            // Call on initialization
            check();

            wf.gatherDestinations().forEach(dest => {
                dest.cleanValidity();
            });

            // Call on validate() method triggered at some othe time
            wf.validate().then(() => {
                check();
                done();
            })

        });

    });

});