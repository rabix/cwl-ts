export enum VertexMissing {CreateVertex, IgnoreEdge, AddEdge, Error}

export class Graph {

    vertices: Map<string, any>;
    edges: Set<[string, string]>;
    
    constructor(vertices?: Iterable<[string, any]>, edges?: Iterable<[string, string]>, missing=VertexMissing.Error) {
        this.vertices = new Map(vertices);
        this.edges = new Set();
        if (edges) {
            for (let item of Array.from(edges)) {
               this.addEdge(item[0], item[1], missing);
            }
        }
    }

    addVertex(key: string, data=null, onConflict?: (old: any)=>any): void {
        if (this.hasVertex(key)) {
            if (onConflict) {
                data = onConflict(this.vertices.get(key));
            } else {
                throw("Vertex '"+ key + "' already exist");    
            }
        }
        this.vertices.set(key, data);
    }

    setVertexData(key: string, data=null): void {
        this.throwMissingVertex(key);
        this.addVertex(key, data, () => {return data;});
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

    addEdge(source: string, destination: string, missing=VertexMissing.Error) {
        switch(missing) {
            case VertexMissing.Error:
                this.throwMissingVertex(source);
                this.throwMissingVertex(destination);
                break;
            case VertexMissing.CreateVertex:
                this.addVertex(source, null, (old) => {return old;});
                this.addVertex(destination, null, (old) => {return old;});
                break;
            case VertexMissing.IgnoreEdge:
                if (!(this.hasVertex(source) && this.hasVertex(destination))) {
                    return;
                }
                break;
        }
        this.edges.add([source, destination]);
    }

    removeEdge(source: string, destination: string): boolean {
        return this.edges.delete([source, destination]);
    }

    topSort(): Array<string> {
        
        if(!this.isConnected()) {
            throw("Can't sort unconnected graph");
        }

        if (this.vertices.size == 0) {
            return [];
        }

        if (this.vertices.size == 1) {
            return [this.vertices.keys().next().value];
        }
        
        let topNodesInit = new Set(this.vertices.keys());
        let unusedEdges = new Set(this.edges.values());
        let sorted = [];

        for (let e of Array.from(unusedEdges)) {
            topNodesInit.delete(e[1]);
        }

        let topNodes = Array.from(topNodesInit);

        while (topNodes.length > 0) {
            let n = topNodes.shift();
            sorted.push(n);
            for (let e of Array.from(unusedEdges)) {
                if (e[0] == n) {
                    unusedEdges.delete(e);
                    if (!this.hasIncoming(e[1], unusedEdges)) {
                        topNodes.push(e[1]);
                    }
                }
            }
        }

        if (unusedEdges.size > 0) {
            throw "Graph has cycles";
        }

        return sorted;
    }

    private hasIncoming(vertex: string, edges: Set<[string, string]>): boolean {
        for (let e of Array.from(edges)) {
            if (e[1] == vertex) {
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

        let unvisited = new Set(this.vertices.keys());
        let starter = unvisited.values().next().value;
        unvisited.delete(starter);
        
        let unusedEdges = new Set(this.edges);
        return this.connectedIter(unvisited, unusedEdges, [starter]);

    }

    private connectedIter(unvisited: Set<string>, unusedEdges: Set<[string, string]>, toExpand: Array<string>): boolean {
        let reached = new Set();
        
        for (let node of toExpand) {
            for (let r of this.reached(unusedEdges, node)) {
                reached.add(r);
            }
        }
        
        for (let item of Array.from(reached)) {
            let existing = unvisited.delete(item);
            if(!existing) {
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

    private reached(unusedEdges: Set<[string, string]>, from: string): Array<string> {
        let reached = new Set();
        for (let item of Array.from(unusedEdges)) {
            if (item[0] == from) {
                reached.add(item[1]);
                unusedEdges.delete(item);
            } else if (item[1] == from) {
                reached.add(item[0]);
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
            return true;
        }
    }

    private throwMissingVertex(key: string): void {
        if (!this.hasVertex(key)) {
            throw("Vertex '"+ key + "' doesn't exist");
        }
    }
}
