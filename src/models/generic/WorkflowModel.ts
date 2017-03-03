import {ValidationBase} from "../helpers/validation/ValidationBase";
import {StepModel} from "./StepModel";
import {WorkflowInputParameterModel} from "./WorkflowInputParameterModel";
import {WorkflowOutputParameterModel} from "./WorkflowOutputParameterModel";
import {Serializable} from "../interfaces/Serializable";
import {WorkflowStepInputModel} from "./WorkflowStepInputModel";
import {WorkflowStepOutputModel} from "./WorkflowStepOutputModel";
import {Edge, EdgeNode, Graph} from "../helpers/Graph";
import {CWLVersion} from "../../mappings/v1.0/CWLVersion";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {CommandLineToolModel} from "./CommandLineToolModel";
import {ExpressionToolModel} from "./ExpressionToolModel";
import {incrementString, intersection} from "../helpers/utils";
import {InputParameter} from "./InputParameter";
import {Process} from "./Process";
import {Process as SBDraft2Process} from "../../mappings/d2sb/Process";
import {
    ID_REGEX, STEP_INPUT_CONNECTION_PREFIX,
    STEP_OUTPUT_CONNECTION_PREFIX
} from "../helpers/constants";
import {OutputParameter} from "./OutputParameter";

export abstract class WorkflowModel extends ValidationBase implements Serializable<any> {
    public id: string;
    public cwlVersion: string | CWLVersion;
    public "class" = "Workflow";

    public steps: StepModel[]                      = [];
    public inputs: WorkflowInputParameterModel[]   = [];
    public outputs: WorkflowOutputParameterModel[] = [];

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
    }


    public serialize(): any {
        new UnimplementedMethodException("serialize", "WorkflowModel");
    }

    public deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize", "WorkflowModel");
    }

    protected _exposePort(inPort: WorkflowStepInputModel, inputConstructor) {
        // remove extraneous connections to this port and set it as invisible
        this.clearPort(inPort);

        this._createInputFromPort(inPort, inputConstructor, false, true);
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
    }

    /**
     * Removes connections to port to out/inputs, removes dangling inputs, sets port to invisible
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
    }

    /**
     * Checks if a workflow input has been leftover after removing
     */
    private removeDanglingInput(source: string) {
        // remove dangling input if it has been left over
        if (!this.graph.hasOutgoing(source)) {
            this.graph.removeVertex(source);
            this.inputs = this.inputs.filter(input => input.connectionId !== source);
        }
    }

    /**
     * Removes step from workflow and from graph
     * removes all connections to step and cleans up dangling inputs
     * @param step
     */
    public removeStep(step: StepModel) {
        this.removeStepFromGraph(step);
    }

    private removeStepFromGraph(step: StepModel) {
        // remove step from graph
        this.graph.removeVertex(step.connectionId);

        const stepIn  = step.in.map(i => i.connectionId);
        const stepOut = step.out.map(o => o.connectionId);

        // remove in ports and out ports from graph
        stepIn.forEach(input => this.graph.removeVertex(input));
        stepOut.forEach(output => this.graph.removeVertex(output));

        // clean up connections
        this.graph.edges.forEach(edge => {
            if (stepIn.indexOf(edge.destination.id) !== -1 ||
                stepOut.indexOf(edge.source.id) !== -1 ||
                edge.destination.id === step.connectionId ||
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
    public removeInput(input: WorkflowInputParameterModel) {

    }

    /**
     * Removes output from workflow and from graph
     * removes all connections
     * @param output
     */
    public removeOutput(output: WorkflowOutputParameterModel) {

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
        let next = this.getNextAvailableId(connectionId);

        if (!id) {
            throw new Error("ID must be set");
        }

        if (!ID_REGEX.test(id)) {
            throw new Error("ID contains illegal characters, only alphanumerics and _ are allowed");
        }

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
    }

    private removeIONodeFromGraph(node: WorkflowInputParameterModel
                                      | WorkflowOutputParameterModel) {
        this.graph.removeVertex(node.connectionId);

        this.graph.edges.forEach(edge => {
            if (edge.destination.id === node.connectionId || edge.source.id === node.connectionId) {
                this.graph.removeEdge(edge);
            }
        });
    }

    public changeIONodeId(node: WorkflowInputParameterModel
                              | WorkflowOutputParameterModel, id: string) {
        if (node.id === id) return;

        const pref = node instanceof WorkflowInputParameterModel ? STEP_OUTPUT_CONNECTION_PREFIX : STEP_INPUT_CONNECTION_PREFIX;
        this.checkIdValidity(id, `${pref}${id}/${id}`);

        const oldConnectionId = node.connectionId;
        const oldId           = (node as WorkflowInputParameterModel).sourceId;
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
                        if (destNode.source[i] === oldId) {
                            destNode.source[i] = node.sourceId;
                        }
                    }
                }
            });
        }
    }

    /**
     * Connects two vertices which have already been added to the graph
     */
    public connect(source: EdgeNode, destination: EdgeNode, isVisible = true) {
        this.graph.addEdge(source, destination, isVisible);
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
    protected getNextAvailableId(connectionId: string): string {
        let hasId  = true;
        let result = connectionId;
        while (hasId) {
            if (hasId = this.graph.hasVertex(result)) {
                result = incrementString(result);
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
                this.validation.errors.push({
                    message: "Workflow is not connected",
                    loc: this.loc
                });
            }

            return isConnected;

        } catch (ex) {
            this.validation.errors.push({
                message: ex,
                loc: this.loc
            });
            return false;
        }
    }

    public hasCycles(): boolean {
        try {
            if (!this.graph) this.graph = this.constructGraph();
            const hasCycles = this.graph.hasCycles();

            if (hasCycles) {
                this.validation.errors.push({
                    message: "Workflow contains cycles",
                    loc: this.loc
                });
            }

            return hasCycles;

        } catch (ex) {
            this.validation.errors.push({
                message: ex,
                loc: this.loc
            });
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
            const pointBType = pointB.type.type;
            const pointAType = pointA.type.type;

            // match types, defined types can be matched with undefined types
            if (pointAType === pointBType || pointAType === "null" || pointBType === "null") {
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
                                           | WorkflowStepInputModel) {

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

    public createInputFromPort(inPort: WorkflowStepInputModel) {
        new UnimplementedMethodException("createInputFromPort", "WorkflowStepInputModel");
    }

    /**
     * @param inPort
     * @param inputConstructor
     * @param show
     * @param create
     * @private
     */
    protected _createInputFromPort(inPort: WorkflowStepInputModel,
                                   inputConstructor: { new(...args: any[]): WorkflowInputParameterModel },
                                   show: boolean   = true,
                                   create: boolean = false): WorkflowInputParameterModel {
        if (!this.graph.hasVertex(inPort.connectionId)) {
            if (!create) {
                throw new Error(`WorkflowStepInputModel ${inPort.destinationId} does not exist on the graph`);
            } else {
                this.graph.addVertex(inPort.connectionId, inPort);
                // connect in port to step
                this.connect({
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
            id: this.getNextAvailableId(`${STEP_OUTPUT_CONNECTION_PREFIX}${inPort.id}/${inPort.id}`), // might change later in case input is already taken
            type: inPort.type ? inPort.type.serialize() : "null",
            fileTypes: inPort.fileTypes,
            inputBinding: inPort["inputBinding"]
        });

        // add a reference to the new input on the inPort
        inPort.source.push(input.sourceId);

        // add it to the workflow tree
        input.setValidationCallback(err => this.updateValidity(err));
        this.inputs.push(input);

        // add input to graph
        this.addInputToGraph(input);
        // connect input with inPort
        this.connect({
            id: input.connectionId,
            type: "WorkflowInput"
        }, {
            id: inPort.connectionId,
            type: "StepInput"
        }, show);

        return input;
    }

    /**
     * Creates a workflow output from a given step.out
     * @param port
     */
    public createOutputFromPort(port: WorkflowStepOutputModel) {
        new UnimplementedMethodException("createOutputFromPort", "WorkflowModel");
    }

    protected _createOutputFromPort(outPort: WorkflowStepOutputModel,
                                    outputConstructor: { new(...args: any[]): WorkflowOutputParameterModel },
                                    show: boolean   = true,
                                    create: boolean = false) : WorkflowOutputParameterModel {

        if (!this.graph.hasVertex(outPort.connectionId)) {
            if (!create) {
                throw new Error(`WorkflowStepInputModel ${outPort.sourceId} does not exist on the graph`);
            } else {
                this.graph.addVertex(outPort.connectionId, outPort);
                // connect in port to step
                this.connect({
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
            id: this.getNextAvailableId(`${STEP_INPUT_CONNECTION_PREFIX}${outPort.id}/${outPort.id}`), // might change later in case output is already taken
            type: outPort.type ? outPort.type.serialize() : "null",
            fileTypes: outPort.fileTypes,
            source: [outPort.sourceId]
        });

        // add it to the workflow tree
        output.setValidationCallback(err => this.updateValidity(err));
        this.outputs.push(output);

        // add output to graph
        this.addOutputToGraph(output);
        // connect output with outPort
        this.connect({
            id: outPort.connectionId,
            type: "StepOutput"
        }, {
            id: output.connectionId,
            type: "WorkflowOutput"
        }, show);

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

    public validate() {
        new UnimplementedMethodException("validate");
    }
}