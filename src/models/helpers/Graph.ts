export enum VertexMissing {CreateVertex, IgnoreEdge, AddEdge, Error}

export interface EdgeNode {
    id: string,
    type?: string
}

export interface Edge {
    source: EdgeNode,
    destination: EdgeNode,
    isValid?: boolean;
    isVisible?: boolean;
}

export class Graph {

    vertices: Map<string, any>;
    edges: Set<Edge>;

    constructor(vertices?: Iterable<[string, any]>, edges?: Iterable<[string, string]>, missing = VertexMissing.Error) {
        this.vertices = new Map(vertices);
        this.edges    = new Set();
        if (edges) {
            for (let item of Array.from(edges)) {
                this.addEdge({id: item[0]}, {id: item[1]}, true, missing);
            }
        }
    }

    addVertex(key: string, data = null, onConflict?: (old: any) => any): void {
        if (this.hasVertex(key)) {
            if (onConflict) {
                data = onConflict(this.vertices.get(key));
            } else {
                throw(new Error("Vertex '" + key + "' already exist"));
            }
        }
        this.vertices.set(key, data);
    }

    setVertexData(key: string, data = null): void {
        this.throwMissingVertex(key);
        this.addVertex(key, data, () => {
            return data;
        });
    }

    getVertexData(key: string): any {
        return this.vertices.get(key);
    }

    hasVertex(key: string): boolean {
        return this.vertices.has(key);
    }

    removeVertex(key: string): boolean {
        return this.vertices.delete(key);
    }

    addEdge(source: EdgeNode, destination: EdgeNode, isVisible = true, missing = VertexMissing.Error) {
        switch (missing) {
            case VertexMissing.Error:
                this.throwMissingVertex(source.id);
                this.throwMissingVertex(destination.id);
                break;
            case VertexMissing.CreateVertex:
                this.addVertex(source.id, null, (old) => {
                    return old;
                });
                this.addVertex(destination.id, null, (old) => {
                    return old;
                });
                break;
            case VertexMissing.IgnoreEdge:
                if (!(this.hasVertex(source.id) && this.hasVertex(destination.id))) {
                    return;
                }
                break;
        }
        this.edges.add({
            source, destination, isVisible, isValid: true
        });
    }

    removeEdge(edge: Edge | [string, string]): boolean {
        if (Array.isArray(edge)) {
            edge = <Edge> {
                source: {id: edge[0]},
                destination: {id: edge[1]}
            }
        }

        return this.edges.delete(Array.from(this.edges.values()).find(e => {
            return e.source.id === (edge as Edge).source.id && e.destination.id === (edge as Edge).destination.id;
        }));
    }

    topSort(): Array<string> {

        if (!this.isConnected()) {
            throw("Can't sort unconnected graph");
        }

        if (this.vertices.size == 0) {
            return [];
        }

        if (this.vertices.size == 1) {
            return [this.vertices.keys().next().value];
        }

        // initialize set of all nodes
        let topNodesInit: Set<string> = new Set(this.vertices.keys());
        // initialize set of all edges
        let unusedEdges: Set<Edge>    = new Set(this.edges.values());
        let sorted                    = [];

        // go through edges, remove nodes which are destinations (meaning they have incoming connections)
        for (let e of Array.from(unusedEdges)) {
            topNodesInit.delete(e.destination.id);
        }

        // create an array of strings from first nodes
        let topNodes: string[] = Array.from(topNodesInit);

        // for each of the first nodes, go through tree
        while (topNodes.length > 0) {
            // remove node from list and add it to sorted nodes
            let n = topNodes.shift();
            sorted.push(n);

            // for each remaining edge check if it originates from this starting node
            for (let e of Array.from(unusedEdges)) {
                if (e.source.id == n) {
                    // delete the edge as used
                    unusedEdges.delete(e);
                    // if the destination node of this edge has no other sources
                    // (no edges contain it as a destination)
                    if (!this.hasIncoming(e.destination.id, unusedEdges)) {
                        // add it as a new starting node
                        topNodes.push(e.destination.id);
                    }
                }
            }
        }

        // leftover edges are back-edges indicating cycles
        if (unusedEdges.size > 0) {
            throw new Error("Graph has cycles");
        }

        return sorted;
    }

    public hasOutgoing(vertex: string, edges: Set<Edge> = this.edges): boolean {
        for (let e of Array.from(edges)) {
            if (e.source.id === vertex) {
                return true;
            }
        }
        return false;
    }

    public hasIncoming(vertex: string, edges: Set<Edge> = this.edges): boolean {
        for (let e of Array.from(edges)) {
            if (e.destination.id == vertex) {
                return true;
            }
        }
        return false;
    }

    isConnected(): boolean {
        if (this.vertices.size == 0 || this.vertices.size == 1) {
            return true;
        }

        if (this.edges.size == 0) {
            return false;
        }

        let unvisited: Set<string> = new Set(this.vertices.keys());
        let starter: string        = unvisited.values().next().value;
        unvisited.delete(starter);

        let unusedEdges: Set<Edge> = new Set(this.edges);
        return this.connectedIter(unvisited, unusedEdges, [starter]);

    }

    private connectedIter(unvisited: Set<string>, unusedEdges: Set<Edge>, toExpand: Array<string>): boolean {
        let reached: Set<string> = new Set();

        for (let node of toExpand) {
            for (let r of this.reached(unusedEdges, node)) {
                reached.add(r);
            }
        }

        for (let item of Array.from(reached)) {
            let existing = unvisited.delete(item);
            if (!existing) {
                reached.delete(item);
            }
        }

        if (unvisited.size == 0) {
            return true;
        }

        if (reached.size == 0) {
            console.log("Unreached nodes", Array.from(unvisited));
            return false;
        }

        return this.connectedIter(unvisited, unusedEdges, Array.from(reached));
    }

    private reached(unusedEdges: Set<Edge>, from: string): Array<string> {
        let reached = new Set();
        for (let item of Array.from(unusedEdges)) {
            if (item.source.id == from) {
                reached.add(item.destination.id);
                unusedEdges.delete(item);
            } else if (item.destination.id == from) {
                reached.add(item.source.id);
                unusedEdges.delete(item);
            }
        }

        return Array.from(reached);
    }

    hasCycles(): boolean {
        if (this.vertices.size == 0) {
            return false;
        }

        if (this.edges.size == 0) {
            return false;
        }

        try {
            this.topSort();
            return false;
        } catch (ex) {
            return ex.message === "Graph has cycles";
        }
    }

    private throwMissingVertex(key: string): void {
        if (!this.hasVertex(key)) {
            throw new Error("Vertex '" + key + "' doesn't exist");
        }
    }
}
