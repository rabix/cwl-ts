import {ValidationBase} from "../helpers/validation/ValidationBase";

import {StepModel} from "./StepModel";
import {WorkflowInputParameterModel} from "./WorkflowInputParameterModel";
import {WorkflowOutputParameterModel} from "./WorkflowOutputParameterModel";
import {Serializable} from "../interfaces/Serializable";
import {WorkflowStepInputModel} from "./WorkflowStepInputModel";
import {WorkflowStepOutputModel} from "./WorkflowStepOutputModel";
import {Edge, Graph} from "../helpers/Graph";
import {CWLVersion} from "../../mappings/v1.0/CWLVersion";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {STEP_OUTPUT_CONNECTION_PREFIX} from "../helpers/constants";

export abstract class WorkflowModel extends ValidationBase implements Serializable<any> {
    public id: string;
    public cwlVersion: string | CWLVersion;

    public steps: StepModel[]                      = [];
    public inputs: WorkflowInputParameterModel[]   = [];
    public outputs: WorkflowOutputParameterModel[] = [];

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

    serialize(): any {
        throw new UnimplementedMethodException("serialize");
    }

    deserialize(attr: any): void {
        throw new UnimplementedMethodException("deserialize");
    }

    public exposePort(port: WorkflowStepInputModel) {
    }

    public includePort(port: WorkflowStepInputModel) {
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

        const nodes: Iterable<any> = [].concat(sources)
            .concat(destinations)
            .concat(this.steps)
            .map(item => {
                return [item.connectionId || item.id, item];
            });

        const graph = new Graph(nodes);

        sources.forEach(source => {
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

        destinations.forEach(dest => {
            const destination = {
                id: dest.connectionId,
                type: this.getNodeType(dest)
            };

            if (dest.source) {
                if (Array.isArray(dest.source)) {
                    dest.source.forEach(s => {
                        // detect if source is a port of an input, if it is a port then add the prefix
                        // to form the connectionId
                        const prefix = s.indexOf("/") !== -1 ? STEP_OUTPUT_CONNECTION_PREFIX : "";

                        const sourceNode = graph.getVertexData(prefix + s);

                        graph.addEdge({
                                id: sourceNode.connectionId,
                                type: this.getNodeType(sourceNode)
                            },
                            destination,
                            sourceNode.isVisible || dest.isVisible)
                    });
                } else {
                    // detect if source is a port of an input, if it is a port then add the prefix
                    // to form the connectionId
                    const prefix = dest.source.indexOf("/") !== -1 ? STEP_OUTPUT_CONNECTION_PREFIX : "";

                    const sourceNode = graph.getVertexData(prefix + dest.source);

                    graph.addEdge({
                            id: sourceNode.connectionId,
                            type: this.getNodeType(sourceNode)
                        },
                        destination,
                        sourceNode.isVisible || dest.isVisible);
                }
            }

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

    customProps: any = {};
}