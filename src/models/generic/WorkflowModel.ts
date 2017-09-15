import {Process as SBDraft2Process} from "../../mappings/d2sb/Process";
import {CWLVersion} from "../../mappings/v1.0/CWLVersion";
import {STEP_INPUT_CONNECTION_PREFIX, STEP_OUTPUT_CONNECTION_PREFIX} from "../helpers/constants";
import {EventHub} from "../helpers/EventHub";
import {Edge, EdgeNode, Graph} from "../helpers/Graph";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {incrementString, intersection, validateID} from "../helpers/utils";
import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {CommandLineToolModel} from "./CommandLineToolModel";
import {ExpressionToolModel} from "./ExpressionToolModel";
import {InputParameter} from "./InputParameter";
import {OutputParameter} from "./OutputParameter";
import {Process} from "./Process";
import {StepModel} from "./StepModel";
import {WorkflowInputParameterModel} from "./WorkflowInputParameterModel";
import {WorkflowOutputParameterModel} from "./WorkflowOutputParameterModel";
import {WorkflowStepInputModel} from "./WorkflowStepInputModel";
import {WorkflowStepOutputModel} from "./WorkflowStepOutputModel";
import {RequirementBaseModel} from "./RequirementBaseModel";
import {ProcessRequirement} from "./ProcessRequirement";
import {ProcessRequirementModel} from "./ProcessRequirementModel";

export abstract class WorkflowModel extends ValidationBase implements Serializable<any> {
    public id: string;
    public cwlVersion: string | CWLVersion;
    public "class" = "Workflow";

    public sbgId: string;

    public hasBatch: boolean = false;

    public batchInput: string;

    public batchByValue: string | string [];

    public steps: StepModel[]                      = [];
    public inputs: WorkflowInputParameterModel[]   = [];
    public outputs: WorkflowOutputParameterModel[] = [];

    public hints: Array<ProcessRequirementModel> = [];

    protected readonly eventHub: EventHub;

    public label?: string;
    public description?: string;

    public customProps: any = {};

    public get connections(): Edge[] {
        return Array.from(this.graph.edges);
    }

    public get nodes(): [string, any][] {
        return Array.from(this.graph.vertices)
    }

    protected graph: Graph;

    constructor(loc: string) {
        super(loc);

        this.eventHub = new EventHub([
            "step.create",
            "step.remove",
            "step.change",
            "step.change.id",
            "step.inPort.show",
            "step.inPort.hide",
            "connections.updated",
            "input.remove",
            "input.create",
            "output.create",
            "output.remove",
            "io.change", // change in type, label, etc
            "io.change.id",
            "connection.create",
            "connection.remove"
        ]);
    }

    public on(event: string, handler): { dispose: Function } {
        return {
            dispose: this.eventHub.on(event, handler)
        }
    }

    public off(event: string, handler) {
        this.eventHub.off(event, handler);
    }

    public serializeEmbedded(retainSource: boolean = false): any {
        new UnimplementedMethodException("serializeEmbedded", "WorkflowModel");
    }

    public serialize(): any {
        new UnimplementedMethodException("serialize", "WorkflowModel");
    }

    public deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize", "WorkflowModel");
    }

    public addHint(hint?: ProcessRequirement | any): RequirementBaseModel {
        new UnimplementedMethodException("addHint", "WorkflowModel");
        return null;
    }

    protected createReq(req: ProcessRequirement, constructor, loc?: string, hint = false): RequirementBaseModel {
        let reqModel: RequirementBaseModel;
        const property = hint ? "hints" : "requirements";
        loc            = loc || `${this.loc}.${property}[${this[property].length}]`;

        reqModel        = new RequirementBaseModel(req, constructor, loc);
        reqModel.isHint = hint;

        (this[property] as Array<ProcessRequirementModel>).push(reqModel);
        reqModel.setValidationCallback((err) => this.updateValidity(err));

        return reqModel;
    }

    public setBatch(input, type): void {};

    public findById(connectionId: string) {
        return this.graph.getVertexData(connectionId);
    }

    protected _exposePort(inPort: WorkflowStepInputModel, inputConstructor): WorkflowInputParameterModel {
        // remove extraneous connections to this port and set it as invisible
        this.clearPort(inPort);

        return this._createInputFromPort(inPort, inputConstructor, false, true);
    }

    /**
     * Expose creates an input on the workflow level and connects it with the exposed port
     * Sets inPort.isVisible to false
     * Sets input.isVisible to false
     */
    public exposePort(inPort: WorkflowStepInputModel) {
        new UnimplementedMethodException("exposePort", "WorkflowModel");
    }

    /**
     * Adds inPort to graph and makes a connection between it and its step
     * sets inPort.isVisible to true
     *
     * @name step.inPort.show
     */
    public includePort(inPort: WorkflowStepInputModel) {
        // check if port was exposed before including it
        if (inPort.status === "exposed") {
            this.clearPort(inPort);
        }

        // add port to canvas
        inPort.isVisible = true;
        // if the port has not been added to the graph yet
        if (!this.graph.hasVertex(inPort.connectionId)) {
            this.graph.addVertex(inPort.connectionId, inPort);
            this.graph.addEdge({
                id: inPort.parentStep.id,
                type: "StepInput"
            }, {
                id: inPort.connectionId,
                type: "Step"
            });
        }

        this.eventHub.emit("step.inPort.show", inPort);
    }

    /**
     * Removes connections to port to out/inputs, removes dangling inputs, sets port to invisible
     *
     * @name step.inPort.hide
     */
    public clearPort(inPort: WorkflowStepInputModel) {
        // remove port from canvas
        inPort.isVisible = false;

        // loop through sources, removing their connections and clearing dangling inputs
        while (inPort.source.length > 0) {

            // pop each source so no connections lead back to port
            let source = inPort.source.pop();

            // source belongs to a step
            const sourceConnectionId = this.getSourceConnectionId(source);
            if (source.indexOf("/") !== -1) {
                this.graph.removeEdge([sourceConnectionId, inPort.connectionId]);
            } else {
                // source is an input
                this.graph.removeEdge([sourceConnectionId, inPort.connectionId]);
                this.removeDanglingInput(sourceConnectionId);
            }
        }

        this.eventHub.emit("step.inPort.hide", inPort);
    }

    /**
     * Checks if a workflow input has been leftover after removing
     */
    private removeDanglingInput(connectionId: string) {
        // remove dangling input if it has been left over
        if (!this.graph.hasOutgoing(connectionId)) {
            this.graph.removeVertex(connectionId);
            this.inputs = this.inputs.filter(input => input.connectionId !== connectionId);
        }
    }

    private removeDanglingOutput(connectionId: string) {
        if (!this.graph.hasIncoming(connectionId)) {
            this.graph.removeVertex(connectionId);
            this.outputs = this.outputs.filter(output => output.connectionId !== connectionId);
        }
    }

    /**
     * Removes step from workflow and from graph
     * removes all connections to step and cleans up dangling inputs
     * @param step
     */
    public removeStep(step: StepModel | string) {
        if (typeof step === "string") {
            step = <StepModel> this.graph.getVertexData(step);
        }

        // remove step from wf.steps
        for (let i = 0; i < this.steps.length; i++) {
            if (this.steps[i].id === step.id) {
                this.steps.splice(i, 1);
                break;
            }
        }
        // remove step from graph and remove all connections
        this.removeStepFromGraph(step);

        // removes inputs that were connected solely to step.in
        let inp = this.inputs.length;
        while (inp--) {
            this.removeDanglingInput(this.inputs[inp].connectionId);
        }

        // removes outputs that were connected solely to step.out
        let out = this.outputs.length;
        while (out--) {
            this.removeDanglingOutput(this.outputs[out].connectionId);
        }

        const dests = this.gatherDestinations();

        for (let j = 0; j < dests.length; j++) {
            for (let i = 0; i < step.out.length; i++) {
                const indexOf = dests[j].source.indexOf(step.out[i].sourceId);
                if (indexOf > -1) {
                    dests[j].source.splice(indexOf, 1);
                }
            }
        }

        this.eventHub.emit("step.remove", step);
    }

    private removeStepFromGraph(step: StepModel) {
        // remove step node from graph
        this.graph.removeVertex(step.connectionId);

        const stepIn  = step.in.map(i => i.connectionId);
        const stepOut = step.out.map(o => o.connectionId);

        // remove in ports and out ports from graph
        stepIn.forEach(input => this.graph.removeVertex(input));
        stepOut.forEach(output => this.graph.removeVertex(output));

        // clean up connections between in/out ports and other nodes
        // and in/out ports and the step itself
        this.graph.edges.forEach(edge => {
            if (stepIn.indexOf(edge.destination.id) !== -1 ||
                stepOut.indexOf(edge.source.id) !== -1) {
                this.eventHub.emit("connection.remove", this.graph.getVertexData(edge.source.id), this.graph.getVertexData(edge.destination.id));
                this.graph.removeEdge(edge);
            } else if (edge.destination.id === step.connectionId ||
                edge.source.id === step.connectionId) {
                this.graph.removeEdge(edge);

            }
        });
    }

    /**
     * Removes input from workflow and from graph
     * removes all connections
     * @param input
     */
    public removeInput(input: WorkflowInputParameterModel | string) {
        if (typeof input === "string") {
            input = <WorkflowInputParameterModel> this.graph.getVertexData(input);
        }

        // remove input from list of inputs on workflow model
        for (let i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i].id == input.id) {
                this.inputs.splice(i, 1);
                break;
            }
        }

        // remove input from graph and remove connections
        this.removeIONodeFromGraph(input);

        // remove dangling outputs, in case one was attached solely to the input being removed
        for (let i = 0; i < this.outputs.length; i++) {
            this.removeDanglingOutput(this.outputs[i].connectionId);
        }

        const dests = this.gatherDestinations();

        // remove source from step.in ports
        for (let i = 0; i < dests.length; i++) {
            const indexOf = dests[i].source.indexOf(input.sourceId);
            if (indexOf !== -1) {
                dests[i].source.splice(indexOf, 1);
            }
        }

        this.eventHub.emit("input.remove", input);
    }

    /**
     * Removes output from workflow and from graph
     * removes all connections
     * @param output
     */
    public removeOutput(output: WorkflowOutputParameterModel | string) {
        if (typeof output === "string") {
            output = <WorkflowOutputParameterModel> this.graph.getVertexData(output);
        }

        // remove output from list of outputs on workflow model
        for (let i = 0; i < this.outputs.length; i++) {
            if (this.outputs[i].id == output.id) {
                this.outputs.splice(i, 1);
                break;
            }
        }

        // removes dangling inputs in case one was attached solely to the output being removed
        for (let i = 0; i < this.inputs.length; i++) {
            this.removeDanglingInput(this.inputs[i].connectionId);
        }

        // remove output from the graph and remove connections
        this.removeIONodeFromGraph(output);

        this.eventHub.emit("output.remove", output);
    }

    /**
     * Checks if source contains stepId.
     * If it does, returns id of step.out, else null;
     * @param source
     * @param stepId
     */
    protected isSourceFromStep(source: string, stepId: string): string {
        throw new UnimplementedMethodException("isSourceFromStep", "WorkflowModel");
    }

    /**
     * Checks if ID is valid and if it already exists on the graph
     * @param id
     * @param connectionId
     */
    private checkIdValidity(id: string, connectionId: string) {
        validateID(id);

        const next = this.getNextAvailableId(connectionId);
        if (next !== id) {
            throw new Error(`ID already exists on graph, the next available id is "${next}"`);
        }
    }

    /**
     * Changes ID of step, updates connections and nodes in graph
     */
    public changeStepId(step: StepModel, id: string) {
        if (id === step.id) {
            return;
        }

        this.checkIdValidity(id, id);

        const oldId = step.id;

        // remove references of step from graph
        this.removeStepFromGraph(step);

        // change id on step and add it to the graph
        step.id = id;
        this.addStepToGraph(step);

        // go through step inputs and re-add all connections
        step.in.forEach(input => {
            const destNode: EdgeNode = {
                id: input.connectionId,
                type: "StepInput"
            };

            input.source.forEach(source => {
                this.connectSource(source, input, destNode);
            });
        });


        // go through all destinations and reconnect step outputs
        this.gatherDestinations().forEach(dest => {
            for (let i = 0; i < dest.source.length; i++) {
                let source = dest.source[i];

                const stepOutput = this.isSourceFromStep(source, oldId);

                if (stepOutput) {
                    dest.source[i] = step.out.find(o => o.id === stepOutput).sourceId;

                    const destination: EdgeNode = {
                        id: dest.connectionId,
                        type: this.getNodeType(dest)
                    };

                    this.connectSource(dest.source[i], dest, destination);
                }
            }
        });

        this.eventHub.emit("step.change.id", step);
    }

    private removeIONodeFromGraph(node: WorkflowInputParameterModel
                                      | WorkflowOutputParameterModel) {
        this.graph.edges.forEach(edge => {
            if (edge.destination.id === node.connectionId || edge.source.id === node.connectionId) {
                this.disconnect(edge.source.id, edge.destination.id);
            }
        });

        this.graph.removeVertex(node.connectionId);
    }

    public changeIONodeId(node: WorkflowInputParameterModel
                              | WorkflowOutputParameterModel, id: string) {
        if (node.id === id) return;

        const pref = node instanceof WorkflowInputParameterModel ? STEP_OUTPUT_CONNECTION_PREFIX : STEP_INPUT_CONNECTION_PREFIX;
        this.checkIdValidity(id, `${pref}${id}/${id}`);

        const oldConnectionId = node.connectionId;
        const oldId = node.id;
        const oldSourceId           = (node as WorkflowInputParameterModel).sourceId;
        node.id               = id;

        this.graph.removeVertex(oldConnectionId);
        this.graph.addVertex(node.connectionId, node);


        // if node is output, just change id, remove from graph, and re-add to graph
        if (node instanceof WorkflowOutputParameterModel) {
            this.graph.edges.forEach(edge => {
                if (edge.destination.id === oldConnectionId) {
                    edge.destination.id = node.connectionId;
                }
            });
        }

        // if node is input, change id, remove from graph and re-add to graph, go through all destinations and change their source
        if (node instanceof WorkflowInputParameterModel) {
            this.graph.edges.forEach(edge => {
                if (edge.source.id === oldConnectionId) {
                    edge.source.id                         = node.connectionId;
                    const destNode: WorkflowStepInputModel = this.graph.getVertexData(edge.destination.id);
                    for (let i = 0; i < destNode.source.length; i++) {
                        if (destNode.source[i] === oldSourceId) {
                            destNode.source[i] = node.sourceId;
                        }
                    }
                }
            });
        }

        this.eventHub.emit("io.change.id", node, oldId);
    }

    /**
     * Connects two vertices which have already been added to the graph
     */
    private addEdge(source: EdgeNode, destination: EdgeNode, isVisible = true) {
        this.graph.addEdge(source, destination, isVisible);
    }

    private checkSrcAndDest(source, destination): [
        WorkflowInputParameterModel
        | WorkflowStepOutputModel, WorkflowOutputParameterModel | WorkflowStepInputModel] {
        // fetch source if connectionId is provided
        if (typeof source === "string") {
            source = <WorkflowInputParameterModel
                | WorkflowStepOutputModel> this.graph.getVertexData(source);
        }

        // fetch destination if connectionId is provided
        if (typeof destination === "string") {
            destination = <WorkflowOutputParameterModel
                | WorkflowStepInputModel> this.graph.getVertexData(destination);
        }

        if (!source || !destination) {
            throw new Error("Source and destination must be defined");
        }

        // type check source
        if (!(source instanceof WorkflowInputParameterModel) && !(source instanceof WorkflowStepOutputModel)) {
            throw new Error(`Expected source to be instanceof WorkflowInputParameterModel or WorkflowStepOutputModel, instead got ${(source as Function).constructor.name}`);
        }

        // type check destination
        if (!(destination instanceof WorkflowOutputParameterModel) && !(destination instanceof WorkflowStepInputModel)) {
            throw new Error(`Expected destination to be instanceof WorkflowOutputParameterModel or WorkflowStepInputModel, instead got ${(destination as Function).constructor.name}`);
        }

        return [source, destination];
    }

    public disconnect(source: WorkflowInputParameterModel | WorkflowStepOutputModel | string,
                      destination: WorkflowOutputParameterModel | WorkflowStepInputModel | string) {
        [source, destination] = this.checkSrcAndDest(source, destination);

        if (this.graph.removeEdge({
                source: {
                    id: source.connectionId
                },
                destination: {
                    id: destination.connectionId
                }
            })) {

            let destLen = destination.source.length;
            while (destLen--) {
                if (destination.source[destLen] === source.sourceId) {
                    destination.source.splice(destLen, 1);
                }
            }

            if (source instanceof WorkflowInputParameterModel) {
                this.removeDanglingInput(source.connectionId);
            }

            if (destination instanceof WorkflowOutputParameterModel) {
                this.removeDanglingOutput(destination.connectionId);
            }

            this.eventHub.emit("connection.remove", source, destination);
        } else {
            throw new Error(`Could not remove nonexistent connection between ${source.connectionId} and ${destination.connectionId}`);
        }
    }

    public connect(source: WorkflowInputParameterModel | WorkflowStepOutputModel | string,
                   destination: WorkflowOutputParameterModel
                       | WorkflowStepInputModel
                       | string, show = true) {

        [source, destination] = this.checkSrcAndDest(source, destination);

        if ((destination as WorkflowStepInputModel).parentStep &&
            (source as WorkflowStepOutputModel).parentStep &&
            (destination as WorkflowStepInputModel).parentStep.id === (source as WorkflowStepOutputModel).parentStep.id) {
            throw new Error(`Cannot connect ports that belong to the same step: ${(destination as WorkflowStepInputModel).parentStep.id}`);
        }

        // add edge to the graph
        this.addEdge({
            id: source.connectionId,
            type: this.getNodeType(source)
        }, {
            id: destination.connectionId,
            type: this.getNodeType(destination)
        }, show);

        // add source to destination
        destination.source.push(source.sourceId);

        this.eventHub.emit("connection.create", source, destination);
    }

    public addStepFromProcess(proc: Process | SBDraft2Process): StepModel {
        new UnimplementedMethodException("addStepFromProcess", "WorkflowModel");
        return undefined;
    }

    public updateStepRun(run: WorkflowModel | CommandLineToolModel | ExpressionToolModel) {
        new UnimplementedMethodException("updateStepRun", "WorkflowModel");
    }

    /**
     * Checks for naming collisions in vertex ids, in case of collisions,
     * it will increment the provided id, otherwise it returns the original id
     */
    protected getNextAvailableId(connectionId: string, isIO = false): string {
        let hasId  = true;
        let result = connectionId;
        let arr    = [];
        if (connectionId.indexOf("/") !== -1 && isIO) {
            arr = result.split("/");
        }

        while (hasId) {
            if (isIO) {
                if (hasId = (this.graph.hasVertex(["in", arr[1], arr[2]].join("/")) || this.graph.hasVertex(["out", arr[1], arr[2]].join("/")))) {
                    arr    = [arr[0], incrementString(arr[1]), incrementString(arr[2])];
                    result = arr.join("/");
                }
            } else {
                if (hasId = this.graph.hasVertex(result)) {
                    result = incrementString(result);
                }
            }
        }

        if (result.indexOf("/") !== -1) {
            return result.split("/")[2];
        }
        return result;
    }

    public isConnected(): boolean {
        try {
            if (!this.graph) this.graph = this.constructGraph();
            const isConnected = this.graph.isConnected();

            if (!isConnected) {

                this.updateValidity({[this.loc]: {
                    message: "Workflow is not connected",
                    type: "warning"
                }});
            }

            return isConnected;

        } catch (ex) {
            this.updateValidity({[this.loc]: {
                message: ex,
                type: "error"
            }});
            return false;
        }
    }

    public hasCycles(): boolean {
        try {
            if (!this.graph) this.graph = this.constructGraph();
            const hasCycles = this.graph.hasCycles();

            if (hasCycles) {
                this.updateValidity({[this.loc]: {
                    message: "Workflow contains cycles",
                    type: "error"
                }});
            }

            return hasCycles;

        } catch (ex) {
            this.updateValidity({[this.loc]: {
                message: ex,
                type: "error"
            }});
            return false;
        }
    }

    /**
     * Finds matching ports to which pointA can connect within the workflow.
     * Looks at port type and fileTypes if they are specified.
     */
    private gatherValidPorts(pointA: any, points: any[]): any[] {
        return points.filter(pointB => {
            // if both ports belong to the same step, connection is not possible
            if (pointA.parentStep && pointB.parentStep && pointA.parentStep.id === pointB.parentStep.id) {
                return false;
            }

            // fetch type
            const pointBType  = pointB.type.type;
            const pointAType  = pointA.type.type;
            const pointBItems = pointB.type.items;
            const pointAItems = pointA.type.items;


            // match types, defined types can be matched with undefined types
            if (pointAType === pointBType // match exact type
                || pointAItems === pointBType //match File[] to File
                || pointBItems === pointAType // match File to File[]
                || pointAType === "null"
                || pointBType === "null") {

                // if both are arrays but not of the same type
                if (pointAItems && pointBItems && pointAItems !== pointBItems) {
                    return false;
                }
                // if type match is file, and fileTypes are defined on both ports,
                // match only if fileTypes match
                if (pointAType === "File" && pointB.fileTypes.length && pointA.fileTypes.length) {
                    return !!intersection(pointB.fileTypes, pointA.fileTypes).length;
                }

                // if not file or fileTypes not defined
                return true;
            }

            // if types are both defined and do not match
            return false;
        });
    }

    /**
     * Finds valid destination ports (workflow.outputs and step.in)
     * for a given source port (workflow.inputs and step.out);
     * @param port
     * @returns {any[]}
     */
    public gatherValidConnectionPoints(port: WorkflowInputParameterModel
                                           | WorkflowStepOutputModel
                                           | WorkflowOutputParameterModel
                                           | WorkflowStepInputModel
                                           | string) {

        if (typeof port === "string") {
            port = this.graph.getVertexData(port);
        }

        if (port instanceof WorkflowInputParameterModel || port instanceof WorkflowStepOutputModel) {
            const destinations = this.gatherDestinations();
            return this.gatherValidPorts(port, destinations);
        } else {
            const sources = this.gatherSources();
            return this.gatherValidPorts(port, sources);
        }
    }

    /**
     * Returns all possible sources on the graph
     */
    public gatherSources(): Array<WorkflowInputParameterModel | WorkflowStepOutputModel> {
        const stepOut = this.steps.reduce((acc, curr) => {
            return acc.concat(curr.out);
        }, []);

        return stepOut.concat(this.inputs);
    }

    /**
     * Returns all possible destinations on the graph
     */
    public gatherDestinations(): Array<WorkflowOutputParameterModel | WorkflowStepInputModel> {
        const stepOut = this.steps.reduce((acc, curr) => {
            return acc.concat(curr.in);
        }, []);

        return stepOut.concat(this.outputs);
    }

    protected addStepToGraph(step: StepModel, graph: Graph = this.graph) {
        graph.addVertex(step.id, step);

        // Sources don't have information about their destinations,
        // so we don't look through them for connections
        step.out.forEach(source => {
            graph.addVertex(source.connectionId, source);
            graph.addEdge({
                    id: source.parentStep.id,
                    type: "Step"
                },
                {
                    id: source.connectionId,
                    type: "StepOutput"
                },
                false
            );
        });

        step.in.forEach(dest => {
            graph.addVertex(dest.connectionId, dest);
            graph.addEdge({
                    id: dest.connectionId,
                    type: "StepInput"
                },
                {
                    id: dest.parentStep.id,
                    type: "Step"
                },
                false
            );
        })
    }

    public createInputFromPort(inPort: WorkflowStepInputModel
                                   | string): WorkflowInputParameterModel {
        new UnimplementedMethodException("createInputFromPort", "WorkflowStepInputModel");
        return undefined;
    }

    /**
     * @param inPort
     * @param inputConstructor
     * @param show
     * @param create
     *
     * @private
     */
    protected _createInputFromPort(inPort: WorkflowStepInputModel | string,
                                   inputConstructor: { new(...args: any[]): WorkflowInputParameterModel },
                                   show: boolean   = true,
                                   create: boolean = false): WorkflowInputParameterModel {
        if (typeof inPort === "string") {
            inPort = <WorkflowStepInputModel> this.graph.getVertexData(inPort);
        }

        if (!inPort || !this.graph.hasVertex(inPort.connectionId)) {
            if (!create) {
                throw new Error(`WorkflowStepInputModel ${inPort.destinationId} does not exist on the graph`);
            } else {
                this.graph.addVertex(inPort.connectionId, inPort);
                // connect in port to step
                this.addEdge({
                    id: inPort.connectionId,
                    type: "StepInput"
                }, {
                    id: inPort.parentStep.id,
                    type: "Step"
                }, false);
            }
        }

        // create new input on the workflow to connect with the port
        const input = new inputConstructor(<InputParameter>{
            id: this.getNextAvailableId(`${STEP_OUTPUT_CONNECTION_PREFIX}${inPort.id}/${inPort.id}`, true), // might change later in case input is already taken
            type: inPort.type ? inPort.type.serialize() : "null",
            ["sbg:fileTypes"]: inPort.fileTypes,
            inputBinding: inPort["inputBinding"]
        }, `${this.loc}.inputs[${this.inputs.length}]`, this.eventHub);

        // add it to the workflow tree
        input.setValidationCallback(err => this.updateValidity(err));
        this.inputs.push(input);

        // add input to graph
        this.addInputToGraph(input);

        // connect input with inPort
        this.connect(input, inPort, show);

        this.eventHub.emit("input.create", input);

        return input;
    }

    /**
     * Creates a workflow output from a given step.out
     * @param port
     */
    public createOutputFromPort(port: WorkflowStepOutputModel
                                    | string): WorkflowOutputParameterModel {
        new UnimplementedMethodException("createOutputFromPort", "WorkflowModel");
        return undefined;
    }

    protected _createOutputFromPort(outPort: WorkflowStepOutputModel | string,
                                    outputConstructor: { new(...args: any[]): WorkflowOutputParameterModel },
                                    show: boolean   = true,
                                    create: boolean = false): WorkflowOutputParameterModel {

        if (typeof outPort === "string") {
            outPort = <WorkflowStepOutputModel> this.graph.getVertexData(outPort);
        }

        if (!outPort || !this.graph.hasVertex(outPort.connectionId)) {
            if (!create) {
                throw new Error(`WorkflowStepInputModel ${outPort.sourceId} does not exist on the graph`);
            } else {
                this.graph.addVertex(outPort.connectionId, outPort);
                // connect in port to step
                this.addEdge({
                    id: outPort.connectionId,
                    type: "StepInput"
                }, {
                    id: outPort.parentStep.id,
                    type: "Step"
                }, false);
            }
        }

        // create new input on the workflow to connect with the port
        const output = new outputConstructor(<OutputParameter>{
            id: this.getNextAvailableId(`${STEP_INPUT_CONNECTION_PREFIX}${outPort.id}/${outPort.id}`, true), // might change later in case output is already taken
            type: outPort.type ? outPort.type.serialize() : "null",
            ["sbg:fileTypes"]: outPort.fileTypes
        }, `${this.loc}.outputs[${this.outputs.length}]`, this.eventHub);


        // add it to the workflow tree
        output.setValidationCallback(err => this.updateValidity(err));
        this.outputs.push(output);

        // add output to graph
        this.addOutputToGraph(output);

        // connect output with outPort
        this.connect(outPort, output, show);

        this.eventHub.emit("output.create", output);
        return output;
    }

    protected addInputToGraph(input: WorkflowInputParameterModel, graph: Graph = this.graph) {
        graph.addVertex(input.connectionId, input);
    }

    protected addOutputToGraph(output: WorkflowOutputParameterModel, graph: Graph = this.graph) {
        graph.addVertex(output.connectionId, output);
    }

    /**
     * Helper function to connect source to destination
     */
    private connectSource(source: string, dest: WorkflowOutputParameterModel
                              | WorkflowStepInputModel, destNode: EdgeNode, graph: Graph = this.graph) {
        const sourceConnectionId = this.getSourceConnectionId(source);
        // detect if source is a port of an input (has a step in its identifier),
        // if it is a port then add the prefix to form the connectionId

        // get source node by connectionId from graph's vertices
        const sourceModel = graph.getVertexData(sourceConnectionId);

        if (sourceModel === undefined) {
            dest.updateValidity({[`${dest.loc}`]: {
                type: "error",
                message: `Destination id ${dest.id} has unknown source ${source}. This may result in a cycle in the graph`
            }});
            console.log("Could not find source node ", sourceConnectionId);
            return;
        }

        // all workflow inputs are visible by default and should be shown
        // except for those which are "exposed", these are explicitly hidden
        const isVisible = !(sourceModel instanceof WorkflowInputParameterModel && !sourceModel.isVisible);

        // if workflow input isn't visible, its destination and connection
        // shouldn't be visible either
        dest.isVisible = isVisible;

        // add a connection between this destination and its source.
        // visibility depends on both nodes, for ports that were "exposed" for example
        // and are connected to nodes which are invisible
        graph.addEdge({
                id: sourceModel.connectionId,
                type: this.getNodeType(sourceModel)
            },
            destNode,
            isVisible);
    };

    public constructGraph(): Graph {
        const destinations = this.gatherDestinations();
        debugger;

        // Create a blank Graph
        const graph = new Graph();

        // Add inputs to graph
        this.inputs.forEach(input => this.addInputToGraph(input, graph));

        // Add outputs to graph
        this.outputs.forEach(output => this.addOutputToGraph(output, graph));

        // Adding steps to graph adds their step.in and step.out as well as connecting in/out to step
        this.steps.forEach(step => this.addStepToGraph(step, graph));


        // Destinations contain all information about connections in .source property,
        // we loop through them and create the appropriate type of connection
        destinations.forEach(dest => {
            // create destination EdgeNode
            const destination: EdgeNode = {
                id: dest.connectionId,
                type: this.getNodeType(dest)
            };

            // No point in connecting if there's no source
            // @todo source should always be an array (just in case), change this check to dest.source.length
            if (dest.source) {
                // if source is an array, loop through all sources for this destination
                debugger;
                if (Array.isArray(dest.source)) {
                    dest.source.forEach(s => {
                        this.connectSource(s, dest, destination, graph);
                    });
                } else {
                    this.connectSource(dest.source, dest, destination, graph);
                }
            }
        });

        return graph;
    }

    /**
     * Returns type of node to be added to graph, for canvas rendering
     */
    private getNodeType(node): string {
        if (node instanceof WorkflowInputParameterModel) {
            return "WorkflowInput"
        } else if (node instanceof WorkflowStepOutputModel) {
            return "StepOutput"
        } else if (node instanceof StepModel) {
            return "Step";
        } else if (node instanceof WorkflowStepInputModel) {
            return "StepInput"
        } else if (node instanceof WorkflowOutputParameterModel) {
            return "WorkflowOutput"
        }
    }

    protected getSourceConnectionId(source: string): string {
        new UnimplementedMethodException("getSourceConnectionId");
        return undefined;
    }
}