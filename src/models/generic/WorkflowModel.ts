import {Process as SBDraft2Process} from "../../mappings/d2sb/Process";
import {CWLVersion} from "../../mappings/v1.0/CWLVersion";
import {NamespaceBag} from "../elements/namespace-bag";
import {STEP_INPUT_CONNECTION_PREFIX, STEP_OUTPUT_CONNECTION_PREFIX} from "../helpers/constants";
import {EventHub} from "../helpers/EventHub";
import {Edge, EdgeNode, Graph} from "../helpers/Graph";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {checkIfConnectionIsValid, fetchByLoc, incrementString, isType, validateID} from "../helpers/utils";
import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Customizable} from '../interfaces/Customizable';
import {Serializable} from "../interfaces/Serializable";
import {V1WorkflowOutputParameterModel} from "../v1.0/V1WorkflowOutputParameterModel";
import {InputParameter} from "./InputParameter";
import {OutputParameter} from "./OutputParameter";
import {Process} from "./Process";
import {ProcessRequirement} from "./ProcessRequirement";
import {ProcessRequirementModel} from "./ProcessRequirementModel";
import {RequirementBaseModel} from "./RequirementBaseModel";
import {StepModel} from "./StepModel";
import {WorkflowInputParameterModel} from "./WorkflowInputParameterModel";
import {WorkflowOutputParameterModel} from "./WorkflowOutputParameterModel";
import {WorkflowStepInputModel} from "./WorkflowStepInputModel";
import {WorkflowStepOutputModel} from "./WorkflowStepOutputModel";
import {ErrorCode} from "../helpers/validation/ErrorCode";
import {ExpressionModel} from "./ExpressionModel";

type VertexNode = WorkflowInputParameterModel | WorkflowOutputParameterModel | StepModel | WorkflowStepInputModel | WorkflowStepOutputModel;

export abstract class WorkflowModel extends ValidationBase implements Serializable<any> {
    id: string;
    cwlVersion: string | CWLVersion;
    class = "Workflow";

    sbgId: string;

    hasBatch: boolean = false;

    batchInput: string;

    batchByValue: string | string [];
    namespaces = new NamespaceBag();

    steps: StepModel[]                      = [];
    inputs: WorkflowInputParameterModel[]   = [];
    outputs: WorkflowOutputParameterModel[] = [];

    hints: Array<ProcessRequirementModel> = [];

    /** Flag to indicate that the tool has finished deserializing */
    protected constructed: boolean = false;

    /** Set of all expressions the tool contains */
    private expressions                        = new Set<ExpressionModel>();

    /** Array of all validation processes that are currently occurring */
    private validationPromises: Promise<any>[] = [];

    protected readonly eventHub: EventHub;

    label?: string;
    description?: string;

    customProps: any = {};

    get connections(): Edge[] {
        return Array.from(this.graph.edges);
    }

    get nodes(): [string, any][] {
        return Array.from(this.graph.vertices)
    }

    private addVertex(connectionId: string, node: VertexNode, graph: Graph = this.graph) {
        try {
            graph.addVertex(connectionId, node, function onConflict() {
                node.id = this.getNextAvailableId(node.connectionId, !(node instanceof StepModel), graph);
                graph.addVertex(node.connectionId, node, onConflict);
            }.bind(this));
        } catch (ex) {
            node.setIssue({
                [node.loc]: {
                    message: ex.message,
                    code: ex.code,
                    type: "error"
                }
            });
        }
    }

    protected graph: Graph;

    constructor(loc: string) {
        super(loc);

        this.eventHub = new EventHub([
            "step.create",
            "step.remove",
            "step.change",
            "step.update",
            "step.change.id",
            "step.inPort.show",
            "step.inPort.hide",
            "step.inPort.remove",
            "step.inPort.create",
            "step.outPort.remove",
            "step.outPort.create",
            "step.port.change",
            "connections.updated",
            "input.remove",
            "input.create",
            "output.create",
            "output.remove",
            "io.change", // change in label, etc
            "io.change.id",
            "io.change.type",
            "validate",
            "connection.create",
            "connection.remove",
            "expression.create",
            "expression.change",
            "expression.serialize"
        ]);

        this.initializeGraphWatchers();

    }

    private initializeGraphWatchers() {
        /**
         * Adds inPort to graph
         * called on step update
         * @name step.inPort.create
         * @see StepModel.compareInPorts
         */
        this.eventHub.on("step.inPort.create", (port: WorkflowStepInputModel) => {

            this.addVertex(port.connectionId, port);

            this.graph.addEdge({
                    id: port.connectionId,
                    type: "StepInput"
                },
                {
                    id: port.parentStep.id,
                    type: "Step"
                },
                false
            );
        });

        /**
         * Adds outPort to graph
         * called on step update
         * @name step.outPort.create
         * @see StepModel.compareOutPorts
         */
        this.eventHub.on("step.outPort.create", (port: WorkflowStepOutputModel) => {
            this.addVertex(port.connectionId, port);

            this.graph.addEdge({
                    id: port.parentStep.id,
                    type: "Step"
                },
                {
                    id: port.connectionId,
                    type: "StepOutput"
                },
                false
            );

        });

        /**
         * Remove input port
         * called when step is updated StepModel.setRunProcess
         * @name step.inPort.remove
         * @see StepModel.compareInPorts
         */
        this.eventHub.on("step.inPort.remove", (port: WorkflowStepInputModel) => {
            this.clearPort(port);
            this.graph.removeVertex(port.connectionId);
            // clean up connection between port and step
            this.graph.removeEdge([port.connectionId, port.parentStep.connectionId]);
        });

        /**
         * Remove output port
         * called when step is updated
         * @name step.outPort.remove
         * @see StepModel.compareOutPorts
         */
        this.eventHub.on("step.outPort.remove", (port: WorkflowStepOutputModel) => {
            this.clearOutPort(port);
            this.graph.removeVertex(port.connectionId);
            // clean up connection between step and port
            this.graph.removeEdge([port.parentStep.connectionId, port.connectionId]);
        });

        /**
         * Changes value of existing node in workflow
         * called when step is updated
         * @name step.port.change
         * @see StepModel.compareOutPorts
         * @see StepModel.compareInPorts
         */
        this.eventHub.on("step.port.change", (port: WorkflowStepOutputModel | WorkflowStepInputModel) => {
            this.graph.setVertexData(port.connectionId, port);
            // check if port is connected to a workflow output
            // if (port instanceof WorkflowStepOutputModel && this.graph.hasOutgoing(port.connectionId)) {
            //     const temporaryEdges = Array.from(this.graph.edges);
            //     temporaryEdges.forEach(e => {
            //         if (e.source.id === port.connectionId) {
            //             const oldOutput = this.findById(e.destination.id);
            //             // make sure the destination is a workflow output and is only connected to the port which changed
            //             if (!(oldOutput instanceof WorkflowOutputParameterModel) || oldOutput.source.length !== 1) return;
            //
            //             // remove the outdated workflow output first to avoid an infinite loop and duplicate ids
            //             this.removeOutput(oldOutput);
            //
            //             // create a new workflow output in place of the one which changed
            //             this.createOutputFromPort(port.connectionId, {customProps: oldOutput.customProps});
            //         }
            //     })
            // }
        });
    }

    abstract getContext(step: StepModel): any;

    protected initializeExprWatchers() {
        this.eventHub.on("expression.create", (expr: ExpressionModel) => {
            this.expressions.add(expr);

            if (this.constructed) {
                this.validationPromises.push(this.validateExpression(expr));
            }
        });

        this.eventHub.on("expression.change", (expr: ExpressionModel) => {
            this.validationPromises.push(this.validateExpression(expr));
        });
    }

    protected validateExpression(expression: ExpressionModel): Promise<any> {
        let input;
        if (/inputs|outputs/.test(expression.loc)) {
            const loc = /.*(?:inputs\[\d+]|.*outputs\[\d+]|.*fields\[\d+])/
                .exec(expression.loc)[0] // take the first match
                .replace("document", ""); // so loc is relative to root
            input     = fetchByLoc(this, loc);
        }

        return expression.validate();
        // return expression.validate(this.getContext(input));
    }

    protected validateAllExpressions() {
        this.expressions.forEach(e => {
            this.validationPromises.push(this.validateExpression(e));
        });
    }

    /**
     * Emitted after a step is created
     * @param {"step.create"} event
     * @param {(step: StepModel) => void} handler
     */
    on(event: "step.create", handler: (step: StepModel) => void);

    /**
     * Emitted after a step is removed
     * @param {"step.remove"} event
     * @param {(step: StepModel) => void} handler
     */
    on(event: "step.remove", handler: (step: StepModel) => void);

    /**
     * Emitted after a step's label has changed
     * @param {"step.change"} event
     * @param {(step: StepModel) => void} handler
     */
    on(event: "step.change", handler: (step: StepModel) => void);

    /**
     * Emitted when step's run is updated
     * @param {"step.update"} event
     * @param {(step: StepModel) => void} handler
     */
    on(event: "step.update", handler: (step: StepModel) => void);

    /**
     * Emitted after a step's ID has changed
     * @param {"step.change.id"} event
     * @param {(step: StepModel) => void} handler
     */
    on(event: "step.change.id", handler: (step: StepModel) => void);

    /**
     * Emitted after a step.run port is included in ports
     * @param {"step.inPort.show"} event
     * @param {(inPort: WorkflowStepInputModel) => void} handler
     */
    on(event: "step.inPort.show", handler: (inPort: WorkflowStepInputModel) => void);

    /**
     * Emitted after a step's in port is hidden from the graph
     * @param {"step.inPort.hide"} event
     * @param {(inPort: WorkflowStepInputModel) => void} handler
     */
    on(event: "step.inPort.hide", handler: (inPort: WorkflowStepInputModel) => void);

    /**
     * Emitted when a step's in ports are removed, such as after an update of the step's run
     * @param {"step.inPort.remove"} event
     * @param {(inPort: WorkflowStepInputModel) => void} handler
     */
    on(event: "step.inPort.remove", handler: (inPort: WorkflowStepInputModel) => void);

    /**
     * Emitted when an in port is added to the step, such as after an update of the step's run
     * @param {"step.inPort.create"} event
     * @param {(inPort: WorkflowStepInputModel) => void} handler
     */
    on(event: "step.inPort.create", handler: (inPort: WorkflowStepInputModel) => void);

    /**
     * Emitted when an out port is removed from the step, such as after an update of the step's run
     * @param {"step.outPort.remove"} event
     * @param {(outPort: WorkflowStepOutputModel) => void} handler
     */
    on(event: "step.outPort.remove", handler: (outPort: WorkflowStepOutputModel) => void);

    /**
     * Emitted when an in port is added to the step, such as after an update of the step's run
     * @param {"step.outPort.create"} event
     * @param {(outPort: WorkflowStepOutputModel) => void} handler
     */
    on(event: "step.outPort.create", handler: (outPort: WorkflowStepOutputModel) => void);

    /**
     * Emitted when a step in/out port is changed during an update of the step's run
     * @param {"step.port.change"} event
     * @param {(port: (WorkflowStepOutputModel | WorkflowStepInputModel)) => void} handler
     */
    on(event: "step.port.change", handler: (port: WorkflowStepOutputModel | WorkflowStepInputModel) => void);

    /**
     * Emitted when an input is removed from the workflow
     * @param {"input.remove"} event
     * @param {(input: WorkflowInputParameterModel) => void} handler
     */
    on(event: "input.remove", handler: (input: WorkflowInputParameterModel) => void);

    /**
     * Emitted when an input is created on the workflow
     * @param {"input.create"} event
     * @param {(input: WorkflowInputParameterModel) => void} handler
     */
    on(event: "input.create", handler: (input: WorkflowInputParameterModel) => void);

    /**
     * Emitted when an output is removed from the workflow
     * @param {"output.remove"} event
     * @param {(output: WorkflowOutputParameterModel) => void} handler
     */
    on(event: "output.remove", handler: (output: WorkflowOutputParameterModel) => void);

    /**
     * Emitted when an output is created on the workflow
     * @param {"output.create"} event
     * @param {(output: WorkflowOutputParameterModel) => void} handler
     */
    on(event: "output.create", handler: (output: WorkflowOutputParameterModel) => void);

    /**
     * Emitted when some property of the workflow input/output changes that affects the rendering of the graph.
     * @example label
     * @param {"io.change"} event
     * @param {(io: (WorkflowOutputParameterModel | WorkflowInputParameterModel)) => void} handler
     */
    on(event: "io.change", handler: (io: WorkflowOutputParameterModel | WorkflowInputParameterModel) => void);

    /**
     * Emitted when id of workflow input/output changes
     * @param {"io.change.id"} event
     * @param {(io: (WorkflowOutputParameterModel | WorkflowInputParameterModel)) => void} handler
     */
    on(event: "io.change.id", handler: (io: WorkflowOutputParameterModel | WorkflowInputParameterModel) => void);

    /**
     * Emitted when id of workflow input/output changes
     * @param {"io.change.type"} event
     * @param {(loc: string) => void} handler
     */
    on(event: "io.change.type", handler: (loc: string) => void);

    /**
     * Emitted when validation of workflow connections finishes
     * @param {"connections.updated"} event
     * @param {() => void} handler
     */
    on(event: "connections.updated", handler: () => void);

    /**
     * Emitted when a connection is removed
     * @param {"connection.remove"} event
     * @param {(source: (WorkflowInputParameterModel | WorkflowStepOutputModel), destination: (WorkflowOutputParameterModel | WorkflowStepInputModel)) => void} handler
     */
    on(event: "connection.remove", handler: (source: WorkflowInputParameterModel | WorkflowStepOutputModel,
                                             destination: WorkflowOutputParameterModel | WorkflowStepInputModel) => void);

    /**
     * Emitted when a connection is created
     * @param {"connection.create"} event
     * @param {(source: (WorkflowInputParameterModel | WorkflowStepOutputModel), destination: (WorkflowOutputParameterModel | WorkflowStepInputModel)) => void} handler
     */
    on(event: "connection.create", handler: (source: WorkflowInputParameterModel | WorkflowStepOutputModel,
                                             destination: WorkflowOutputParameterModel | WorkflowStepInputModel) => void);


    on(event: string, handler): { dispose: Function } {
        return {
            dispose: this.eventHub.on(event, handler)
        }
    }

    off(event: string, handler) {
        this.eventHub.off(event, handler);
    }

    serializeEmbedded(retainSource: boolean = false): any {
        new UnimplementedMethodException("serializeEmbedded", "WorkflowModel");
    }

    serialize(): any {
        new UnimplementedMethodException("serialize", "WorkflowModel");
    }

    deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize", "WorkflowModel");
    }

    addHint(hint?: ProcessRequirement | any): RequirementBaseModel {
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

    setBatch(input, type): void {
    };

    findById(connectionId: string) {
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
    exposePort(inPort: WorkflowStepInputModel) {
        new UnimplementedMethodException("exposePort", "WorkflowModel");
    }

    /**
     * Adds inPort to graph and makes a connection between it and its step
     * sets inPort.isVisible to true
     *
     * @name step.inPort.show
     */
    includePort(inPort: WorkflowStepInputModel) {
        // check if port was exposed before including it
        if (inPort.status === "exposed") {
            this.clearPort(inPort);
        }

        // add port to canvas
        inPort.isVisible = true;
        // if the port has not been added to the graph yet
        if (!this.graph.hasVertex(inPort.connectionId)) {
            this.addVertex(inPort.connectionId, inPort);
            this.graph.addEdge({
                id: inPort.parentStep.id,
                type: "StepInput"
            }, {
                id: inPort.connectionId,
                type: "Step"
            }, true);
        }

        this.eventHub.emit("step.inPort.show", inPort);
    }

    /**
     * Removes connections to port to out/inputs, removes dangling inputs, sets port to invisible
     *
     * @name step.inPort.hide
     */
    clearPort(inPort: WorkflowStepInputModel) {
        // loop through sources, removing their connections and clearing dangling inputs
        while(inPort.source.length) {
            // because disconnect will remove the source once disconnected, we'll just reference it here
            const source = inPort.source[0];

            const sourceConnectionId = this.getSourceConnectionId(source);

            // disconnect takes care of edges and dangling inputs
            this.disconnect(sourceConnectionId, inPort.connectionId);
        }

        // remove visibility on the port so it isn't shown on canvas anymore
        inPort.isVisible = false;

        // send an event so the canvas knows it should hide it
        this.eventHub.emit("step.inPort.hide", inPort);

        inPort.clearIssue(ErrorCode.ALL);
    }

    clearOutPort(outPort: WorkflowStepOutputModel) {
        this.graph.edges.forEach(e => {
            // if the edge is connected to the output, it needs to be cleared and removed
            if (e.source.id === outPort.connectionId) {

                // if a connection is found, disconnect it
                // this handles dangling outputs
                this.disconnect(outPort.connectionId, e.destination.id);
            }
        });

        outPort.isVisible = false;
    }

    /**
     * Checks if a workflow input has been leftover after removing
     */
    private removeDanglingInput(connectionId: string) {
        // remove dangling input if it has been left over
        if (!this.graph.hasOutgoing(connectionId)) {
            this.graph.removeVertex(connectionId);
            this.inputs = this.inputs.filter(input => {
                if (input.connectionId === connectionId) {
                    this.eventHub.emit("input.remove", input);
                    return false;
                }

                return true;
            });
        }
    }

    private removeDanglingOutput(connectionId: string) {
        if (!this.graph.hasIncoming(connectionId)) {
            this.graph.removeVertex(connectionId);

            this.outputs = this.outputs.filter(output => {
                if (output.connectionId === connectionId) {
                    output.clearIssue(ErrorCode.ALL);
                    this.eventHub.emit("output.remove", output);
                    return false;
                }

                return true;
            });
        }
    }

    /**
     * Removes step from workflow and from graph
     * removes all connections to step and cleans up dangling inputs
     * @param step
     */
    removeStep(step: StepModel | string) {
        if (typeof step === "string") {
            step = <StepModel> this.graph.getVertexData(step);
        }

        // remove step from wf.steps
        for (let i = 0; i < this.steps.length; i++) {
            if (this.steps[i].id === step.id) {
                this.steps[i].clearIssue(ErrorCode.ALL);
                this.steps.splice(i, 1);
                break;
            }
        }

        const dests = this.gatherDestinations();

        for (let j = 0; j < dests.length; j++) {
            for (let i = 0; i < step.out.length; i++) {
                const indexOf = dests[j].source.indexOf(step.out[i].sourceId);
                if (indexOf > -1) {
                    dests[j].source.splice(indexOf, 1);
                    this.validateDestination(dests[j]);
                }
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

        step.cleanValidity();

        this.eventHub.emit("step.remove", step);
    }

    private removeStepFromGraph(step: StepModel) {
        // remove step node from graph
        this.graph.removeVertex(step.connectionId);

        const stepIn  = step.in.map(i => i.connectionId);
        const stepOut = step.out.map(o => o.connectionId);

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

        // remove in ports and out ports from graph
        stepIn.forEach(input => this.graph.removeVertex(input));
        stepOut.forEach(output => this.graph.removeVertex(output));
    }

    /**
     * Removes input from workflow and from graph
     * removes all connections
     * @param input
     */
    removeInput(input: WorkflowInputParameterModel | string) {
        if (typeof input === "string") {
            input = <WorkflowInputParameterModel> this.graph.getVertexData(input);
        }

        // remove input from list of inputs on workflow model
        for (let i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i].id == input.id) {
                this.inputs[i].clearIssue(ErrorCode.ALL);
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
    removeOutput(output: WorkflowOutputParameterModel | string) {
        if (typeof output === "string") {
            output = <WorkflowOutputParameterModel> this.graph.getVertexData(output);
        }

        // remove output from list of outputs on workflow model
        for (let i = 0; i < this.outputs.length; i++) {
            if (this.outputs[i].id == output.id) {
                this.outputs[i].clearIssue(ErrorCode.ALL);
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
    changeStepId(step: StepModel, id: string) {
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

    changeIONodeId(node: WorkflowInputParameterModel
        | WorkflowOutputParameterModel, id: string) {
        if (node.id === id) return;

        const pref = node instanceof WorkflowInputParameterModel ? STEP_OUTPUT_CONNECTION_PREFIX : STEP_INPUT_CONNECTION_PREFIX;
        this.checkIdValidity(id, `${pref}${id}/${id}`);

        const oldConnectionId = node.connectionId;
        const oldId           = node.id;
        const oldSourceId     = (node as WorkflowInputParameterModel).sourceId;
        node.id               = id;

        this.graph.removeVertex(oldConnectionId);
        this.addVertex(node.connectionId, node);


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
    private addEdge(source: EdgeNode, destination: EdgeNode, isVisible = true, isValid = true) {
        this.graph.addEdge(source, destination, isVisible, isValid);
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

            this.validateDestination(destination);

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

    connect(source: WorkflowInputParameterModel | WorkflowStepOutputModel | string,
            destination: WorkflowOutputParameterModel
                | WorkflowStepInputModel
                | string, show = true) {

        [source, destination] = this.checkSrcAndDest(source, destination);

        if ((destination as WorkflowStepInputModel).parentStep &&
            (source as WorkflowStepOutputModel).parentStep &&
            (destination as WorkflowStepInputModel).parentStep.id === (source as WorkflowStepOutputModel).parentStep.id) {
            throw new Error(`Cannot connect ports that belong to the same step: ${(destination as WorkflowStepInputModel).parentStep.id}`);
        }
        // add source to destination
        destination.source.push(source.sourceId);

        const isValid = this.validateConnection(destination, source);

        // add edge to the graph
        this.addEdge({
            id: source.connectionId,
            type: this.getNodeType(source)
        }, {
            id: destination.connectionId,
            type: this.getNodeType(destination)
        }, show, isValid);

        this.eventHub.emit("connection.create", source, destination);

        return isValid;
    }

    addStepFromProcess(proc: Process | SBDraft2Process): StepModel {
        new UnimplementedMethodException("addStepFromProcess", "WorkflowModel");
        return undefined;
    }

    /**
     * Checks for naming collisions in vertex ids, in case of collisions,
     * it will increment the provided id, otherwise it returns the original id
     */
    protected getNextAvailableId(connectionId: string, isIO = false, graph: Graph = this.graph): string {
        let hasId  = true;
        let result = connectionId;
        let arr    = [];
        if (connectionId.indexOf("/") !== -1 && isIO) {
            arr = result.split("/");
        }

        while (hasId) {
            if (isIO) {
                if (hasId = (graph.hasVertex(["in", arr[1], arr[2]].join("/")) || graph.hasVertex(["out", arr[1], arr[2]].join("/")))) {
                    arr    = [arr[0], incrementString(arr[1]), incrementString(arr[2])];
                    result = arr.join("/");
                }
            } else {
                if (hasId = graph.hasVertex(result)) {
                    result = incrementString(result);
                }
            }
        }

        if (result.indexOf("/") !== -1) {
            return result.split("/")[2];
        }
        return result;
    }

    isConnected(): boolean {
        try {
            if (!this.graph) this.graph = this.constructGraph();
            const isConnected = this.graph.isConnected();

            if (!isConnected) {

                this.setIssue({
                    [this.loc]: {
                        message: "Workflow is not connected",
                        type: "warning"
                    }
                });
            }

            return isConnected;

        } catch (ex) {
            this.setIssue({
                [this.loc]: {
                    message: ex,
                    type: "error"
                }
            });
            return false;
        }
    }

    hasCycles(): boolean {
        try {
            if (!this.graph) this.graph = this.constructGraph();
            const hasCycles = this.graph.hasCycles();

            if (hasCycles) {
                this.setIssue({
                    [this.loc]: {
                        message: "Workflow contains cycles",
                        type: "error"
                    }
                });
            }

            return hasCycles;

        } catch (ex) {
            this.setIssue({
                [this.loc]: {
                    message: ex,
                    type: "error"
                }
            });
            return false;
        }
    }

    /**
     * Finds matching ports to which pointA can connect within the workflow.
     * Looks at port type and fileTypes if they are specified.
     */
    private gatherValidPorts(pointA: any, points: any[], ltr: boolean): any[] {
        return points.filter(pointB => {
            try {
                checkIfConnectionIsValid(pointA, pointB, ltr);
                return true;
            } catch (e) {
                return false
            }
        });
    }

    /**
     * Finds valid destination ports (workflow.outputs and step.in)
     * for a given source port (workflow.inputs and step.out);
     * @param port
     * @returns {any[]}
     */
    gatherValidConnectionPoints(port: WorkflowInputParameterModel
        | WorkflowStepOutputModel
        | WorkflowOutputParameterModel
        | WorkflowStepInputModel
        | string): any[] {

        if (typeof port === "string") {
            port = this.graph.getVertexData(port);
        }

        if (port instanceof WorkflowInputParameterModel || port instanceof WorkflowStepOutputModel) {
            const destinations = this.gatherDestinations();
            return this.gatherValidPorts(port, destinations, true);
        } else {
            const sources = this.gatherSources();
            return this.gatherValidPorts(port, sources, false);
        }
    }

    /**
     * Returns all possible sources on the graph
     */
    gatherSources(): Array<WorkflowInputParameterModel | WorkflowStepOutputModel> {
        const stepOut = this.steps.reduce((acc, curr) => {
            return acc.concat(curr.out);
        }, []);

        return stepOut.concat(this.inputs);
    }

    /**
     * Returns all possible destinations on the graph
     */
    gatherDestinations(): Array<WorkflowOutputParameterModel | WorkflowStepInputModel> {
        const stepOut = this.steps.reduce((acc, curr) => {
            return acc.concat(curr.in);
        }, []);

        return stepOut.concat(this.outputs);
    }

    protected addStepToGraph(step: StepModel, graph: Graph = this.graph) {
        this.addVertex(step.id, step, graph);

        // Sources don't have information about their destinations,
        // so we don't look through them for connections
        step.out.forEach(source => {
            this.addVertex(source.connectionId, source, graph);
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
            this.addVertex(dest.connectionId, dest, graph);
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

    abstract createInputFromPort(inPort: WorkflowStepInputModel | string, data?: Customizable): WorkflowInputParameterModel;

    /**
     * @param inPort
     * @param inputConstructor
     * @param show
     * @param create
     *
     * @param data
     * @private
     */
    protected _createInputFromPort(inPort: WorkflowStepInputModel | string,
                                   inputConstructor: { new(...args: any[]): WorkflowInputParameterModel },
                                   show: boolean      = true,
                                   create: boolean    = false,
                                   data: Customizable = {}): WorkflowInputParameterModel {
        if (typeof inPort === "string") {
            inPort = <WorkflowStepInputModel> this.graph.getVertexData(inPort);
        }

        if (!inPort || !this.graph.hasVertex(inPort.connectionId)) {
            if (!create) {
                throw new Error(`WorkflowStepInputModel ${inPort.destinationId} does not exist on the graph`);
            } else {
                this.addVertex(inPort.connectionId, inPort);
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

        let type = inPort.type ? inPort.type.serialize() : "null";

        if (isType(inPort, ['stdin'])) type = 'File';

        // create new input on the workflow to connect with the port
        const inputParam = Object.assign({
            id: this.getNextAvailableId(`${STEP_OUTPUT_CONNECTION_PREFIX}${inPort.id}/${inPort.id}`, true), // might change later in case input is already taken
            type,
            description: (inPort["doc"] === undefined) && inPort.description ? inPort.description : undefined,
            doc: inPort.description ? inPort.description : inPort["doc"],
            label: inPort.label,
            ["sbg:fileTypes"]: inPort.fileTypes,
            inputBinding: inPort["inputBinding"],
            secondaryFiles: inPort["secondaryFiles"]
        }, data.customProps);
        const input      = new inputConstructor(<InputParameter>inputParam, `${this.loc}.inputs[${this.inputs.length}]`, this.eventHub);

        // add it to the workflow tree
        input.setValidationCallback(err => this.updateValidity(err));
        this.inputs.push(input);

        // add input to graph
        this.addInputToGraph(input);
        input.isVisible = show;
        inPort.isVisible = show;

        this.eventHub.emit("input.create", input);

        // connect input with inPort
        this.connect(input, inPort, show);


        return input;
    }

    /**
     * Creates a workflow output from a given step.out
     * @param port
     * @param data
     */
    abstract createOutputFromPort(port: WorkflowStepOutputModel | string, data?: Customizable): WorkflowOutputParameterModel;

    protected _createOutputFromPort(outPort: WorkflowStepOutputModel | string,
                                    outputConstructor: { new(...args: any[]): WorkflowOutputParameterModel },
                                    show: boolean      = true,
                                    create: boolean    = false,
                                    opts: Customizable = {}): WorkflowOutputParameterModel {

        if (typeof outPort === "string") {
            outPort = <WorkflowStepOutputModel> this.graph.getVertexData(outPort);
        }

        if (!outPort || !this.graph.hasVertex(outPort.connectionId)) {
            if (!create) {
                throw new Error(`WorkflowStepInputModel ${outPort.sourceId} does not exist on the graph`);
            } else {
                this.addVertex(outPort.connectionId, outPort);
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
        let outputParam = Object.assign({
            id: this.getNextAvailableId(`${STEP_INPUT_CONNECTION_PREFIX}${outPort.id}/${outPort.id}`, true), // might change later in case output is already taken
            type: outPort.type ? outPort.type.serialize() : "null",
            ["sbg:fileTypes"]: outPort.fileTypes,
            secondaryFiles: outPort["secondaryFiles"],
            description: (outPort["doc"] === undefined) && outPort.description ? outPort.description : undefined,
            doc: outPort.description ? outPort.description : outPort["doc"],
            label: outPort.label,
        }, opts.customProps) as OutputParameter;

        const output = new outputConstructor(outputParam, `${this.loc}.outputs[${this.outputs.length}]`, this.eventHub);


        // add it to the workflow tree
        output.setValidationCallback(err => this.updateValidity(err));
        this.outputs.push(output);

        // add output to graph
        this.addOutputToGraph(output);

        this.eventHub.emit("output.create", output);

        outPort.isVisible = show;

        // connect output with outPort
        this.connect(outPort, output, show);

        return output;
    }

    protected addInputToGraph(input: WorkflowInputParameterModel, graph: Graph = this.graph) {
        this.addVertex(input.connectionId, input, graph);
    }

    protected addOutputToGraph(output: WorkflowOutputParameterModel, graph: Graph = this.graph) {
        this.addVertex(output.connectionId, output, graph);
    }

    /**
     * Helper function to connect source to destination
     */
    private connectSource(sourceId: string, dest: WorkflowOutputParameterModel
        | WorkflowStepInputModel, destNode: EdgeNode, graph: Graph = this.graph) {
        const sourceConnectionId = this.getSourceConnectionId(sourceId);
        // detect if source is a port of an input (has a step in its identifier),
        // if it is a port then add the prefix to form the connectionId

        // get source node by connectionId from graph's vertices
        const sourceModel = graph.getVertexData(sourceConnectionId);

        if (sourceModel === undefined) {
            dest.setIssue({
                [`${dest.loc}`]: {
                    type: "error",
                    message: `Destination id ${dest.id} has unknown source "${sourceId}". This may result in a cycle in the graph`
                }
            });
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

        const isValid = this.validateConnection(dest, sourceModel, graph);

        graph.addEdge({
                id: sourceModel.connectionId,
                type: this.getNodeType(sourceModel)
            },
            destNode,
            isVisible,
            isValid);

    };

    constructGraph(): Graph {
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

    /**
     * Validate all visible connections and sets correct validity state on destinations
     */
    protected validateConnections(): void {

        const sources      = this.gatherSources();
        const destinations = this.gatherDestinations();

        this.connections.forEach((connection) => {

            if (connection.isVisible) {
                const source = sources.find((item) => {
                    return item.connectionId === connection.source.id;
                });

                const destination = destinations.find((item) => {
                    return item.connectionId === connection.destination.id;
                });

                this.validateConnection(destination, source);
            }
        });
    }

    /**
     * Validate connection between source and destination and sets correct validity state on destination
     */
    private validateConnection(destination: WorkflowOutputParameterModel | WorkflowStepInputModel,
                               source: WorkflowInputParameterModel | WorkflowStepOutputModel, graph = this.graph) {

        if (!source || !destination) {
            return;
        }

        let isValid = false;

        try {
            checkIfConnectionIsValid(source, destination);
            isValid = true;

        } catch (e) {

            const sourceText = destination instanceof V1WorkflowOutputParameterModel ? "outputSource" : "source";


            destination.setIssue({
                [destination.loc + `.${sourceText}[` + source.sourceId + "]"]: {
                    message: e.message,
                    type: "warning",
                    code: e.code
                }
            });
        }

        Array.from(graph.edges).filter((c) =>
            c.isVisible && (c.destination.id === destination.connectionId && c.source.id === source.connectionId))
            .forEach((c) => {
                c.isValid = isValid;
            });

        return isValid;
    }

    /**
     * Validate all connections made with given destination
     */
    private validateDestination(destination: WorkflowOutputParameterModel | WorkflowStepInputModel) {

        destination.clearIssue(ErrorCode.CONNECTION_ALL);

        // Find all sources connected to given destination
        const sources = this.connections.filter((connection) => {
            return connection.isVisible && (connection.destination.id === destination.connectionId);
        }).map((connection) => {
            return this.findById(connection.source.id);
        });

        // Validate all connections
        sources.forEach((source) => {
            this.validateConnection(destination, source);
        });

    }

    /**
     * Validate all connections made with given IO port
     */
    validateConnectionsForIOPort(port: WorkflowOutputParameterModel | WorkflowInputParameterModel) {

        if (port instanceof WorkflowInputParameterModel) {

            const destinations = this.connections.filter((connection) => {
                return connection.isVisible && (connection.source.id === port.connectionId);
            }).map((connection) => {
                return this.findById(connection.destination.id);
            });

            // Validate destination in case when connection goes from invalid > valid to remove warning
            // (This is because we do not have currently method to remove certain keys in issues - ValidationBase)
            destinations.forEach(destination => {
                this.validateDestination(destination);
            });

        } else {
            // If port is output
            this.validateDestination(port as WorkflowOutputParameterModel);
        }

        this.eventHub.emit("connections.updated");
    }

    protected validateGraph() {
        try {
            this.graph.topSort();
        } catch (ex) {
            if (ex.message === "Graph has cycles") {
                this.setIssue({
                    [this.loc]: {
                        message: "Graph has cycles",
                        type: "error"
                    }
                });
            } else if (ex === "Can't sort unconnected graph") {
                this.setIssue({
                    [this.loc]: {
                        message: "Graph is not connected",
                        type: "warning"
                    }
                });
            }
        }
    }

    validate(): Promise<any> {
        this.validateAllExpressions();

        return Promise.all(this.validationPromises).then(() => {
            this.validationPromises = [];
        });
    }
}
