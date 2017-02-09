import {ValidationBase} from "../helpers/validation/ValidationBase";

import {StepModel} from "./StepModel";
import {WorkflowInputParameterModel} from "./WorkflowInputParameterModel";
import {WorkflowOutputParameterModel} from "./WorkflowOutputParameterModel";
import {Serializable} from "../interfaces/Serializable";
import {WorkflowStepInputModel} from "./WorkflowStepInputModel";
import {WorkflowStepOutputModel} from "./WorkflowStepOutputModel";
import {Edge, Graph} from "../helpers/Graph";

export abstract class WorkflowModel extends ValidationBase implements Serializable<any> {
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
        console.warn("versioned class must override serialize() method");
        return undefined;
    }

    deserialize(attr: any): void {
        console.warn("versioned class must override deserialize(attr: any) method");
    }

    public exposePort(port: WorkflowStepInputModel) {
    }

    public includePort(port: WorkflowStepInputModel) {
    }

    public isConnected(): boolean {
        try {
            if (!this.graph) this.graph = this.constructGraph();
            const isConnected = this.graph.isConnected();

            console.log("isConnected", isConnected);
            if (!isConnected) {
                console.log(this.graph);
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

            console.log("hasCycles", hasCycles);
            if (hasCycles) {
                console.log(this.graph);
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
                        graph.addEdge({
                            id: s,
                            type: this.getNodeType(graph.getVertexData(s))
                        }, destination)
                    });
                } else {
                    graph.addEdge({
                        id: dest.source,
                        type: this.getNodeType(graph.getVertexData(dest.source))
                    }, destination);
                }
            }

            if (dest instanceof WorkflowStepInputModel) {
                graph.addEdge(destination, {
                    id: dest.parentStep.id,
                    type: "Step"
                }, false);
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