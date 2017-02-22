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
import {intersection} from "../helpers/utils";

export abstract class WorkflowModel extends ValidationBase implements Serializable<any> {
    public id: string;
    public cwlVersion: string | CWLVersion;

    public steps: StepModel[]                      = [];
    public inputs: WorkflowInputParameterModel[]   = [];
    public outputs: WorkflowOutputParameterModel[] = [];

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

    public exposePort(port: WorkflowStepInputModel) {
        new UnimplementedMethodException("exposePort", "WorkflowModel");
    }

    public includePort(port: WorkflowStepInputModel) {
        new UnimplementedMethodException("includePort", "WorkflowModel");
    }

    public clearPort(port: WorkflowStepInputModel) {
        new UnimplementedMethodException("clearPort", "WorkflowModel");
    }

    public addStep(step: StepModel) {
        new UnimplementedMethodException("addStep", "WorkflowModel");
    }

    public updateStepRun(run: WorkflowModel | CommandLineToolModel | ExpressionToolModel) {
        new UnimplementedMethodException("updateStepRun", "WorkflowModel");
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
     * for a given source port (workflow.inputs and step.out)
     */
    public gatherValidDestinations(source: WorkflowInputParameterModel | WorkflowStepOutputModel): Array<WorkflowOutputParameterModel | WorkflowStepInputModel> {
        const destinations = this.gatherDestinations();

        return this.gatherValidPorts(source, destinations);
    }

    /**
     * Finds valid destination ports (workflow.inputs and step.out)
     * for a given source port (workflow.outputs and step.in)
     */
    public gatherValidSources(dest: WorkflowOutputParameterModel | WorkflowStepInputModel): Array<WorkflowInputParameterModel | WorkflowStepOutputModel> {
        const sources = this.gatherSources();

        return this.gatherValidPorts(dest, sources);
    }

    public gatherSources(): Array<WorkflowInputParameterModel | WorkflowStepOutputModel> {
        const stepOut = this.steps.reduce((acc, curr) => {
            return acc.concat(curr.out);
        }, []);

        return stepOut.concat(this.inputs);
    }

    public gatherDestinations(): Array<WorkflowOutputParameterModel | WorkflowStepInputModel> {
        const stepOut = this.steps.reduce((acc, curr) => {
            return acc.concat(curr.in);
        }, []);

        return stepOut.concat(this.outputs);
    }

    public constructGraph(): Graph {
        const sources      = this.gatherSources();
        const destinations = this.gatherDestinations();

        // Gather all possible sources and destinations
        const nodes: Iterable<any> = [].concat(sources)
            .concat(destinations)
            .concat(this.steps)
            .map(item => {
                return [item.connectionId, item];
            });

        // Construct a new Graph with nodes first, then add edges
        const graph = new Graph(nodes);

        // Sources don't have information about their destinations,
        // so we don't look through them for connections
        sources.forEach(source => {
            // however, if the source comes from a step, we create an invisible connection between
            // the step and its output
            if (source instanceof WorkflowStepOutputModel) {
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
            }
        });

        /**
         * Helper function to connect source to destination
         */
        const connectSource = (source: string, dest: WorkflowOutputParameterModel | WorkflowStepInputModel, destNode: EdgeNode) => {
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
                isVisible)
        };

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
                        connectSource(s, dest, destination);
                    });
                } else {
                    connectSource(dest.source, dest, destination);
                }
            }

            // If the destination is a step input, regardless of its connections, it must
            // be connected with its parent step, this connection is invisible
            if (dest instanceof WorkflowStepInputModel) {
                graph.addEdge(destination, {
                        id: dest.parentStep.id,
                        type: "Step"
                    },
                    false);
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