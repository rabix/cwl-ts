import {ValidationBase} from "../helpers/validation/ValidationBase";

import {StepModel} from "./StepModel";
import {WorkflowInputParameterModel} from "./WorkflowInputParameterModel";
import {WorkflowOutputParameterModel} from "./WorkflowOutputParameterModel";
import {Serializable} from "../interfaces/Serializable";
import {WorkflowStepInputModel} from "./WorkflowStepInputModel";
import {WorkflowStepOutputModel} from "./WorkflowStepOutputModel";
import {Graph} from "../helpers/Graph";

export class WorkflowModel extends ValidationBase implements Serializable<any> {
    public steps: StepModel[];
    public inputs: WorkflowInputParameterModel[];
    public outputs: WorkflowOutputParameterModel[];

    private graph: Graph;

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
                graph.addEdge(source.parentStep.id, source.connectionId);
            }
        });

        destinations.forEach(dest => {
            if (dest.source) {
                if (Array.isArray(dest.source)) {
                    dest.source.forEach(s => {
                        graph.addEdge(s, dest.connectionId)
                    });
                } else {
                    graph.addEdge(dest.source, dest.connectionId);
                }
            }

            if (dest instanceof WorkflowStepInputModel) {
                graph.addEdge(dest.connectionId, dest.parentStep.id);
            }
        });

        return graph;
    }

    customProps: any = {};
}