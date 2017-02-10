import { Graph, VertexMissing } from './Graph';
import {expect} from "chai";

describe("Graph", () => {
    
    describe("isConnected", () => {
        it("should return true for null graphs", () => {
            let g = new Graph();
            expect(g.isConnected()).to.be.true;
        });

        it("should return true for graphs with one vertex", () => {
            let vertex: [string, any] = ['a', null];
            let g = new Graph([vertex]);
            expect(g.isConnected()).to.be.true;
        });

        it("should return false for graphs with many vertices and no edges", () => {
            let vertices: Array<[string, any]> = [['a', null], ['b', null]];
            let g = new Graph(vertices);
            expect(g.isConnected()).to.be.false;
        });

        it("should return false for unconnected graphs", () => {
            let vertices: Array<[string, any]> = [['a', null]];
            let edges: [[string, string]] = [['b', 'c']];
            let g = new Graph(vertices, edges, VertexMissing.CreateVertex);
            expect(g.isConnected()).to.be.false;

            edges = [
                ['a', 'b'],
                ['b', 'c'],
                ['b', 'd'],
                ['e', 'f']
            ];

            g = new Graph(null, edges, VertexMissing.CreateVertex);
            expect(g.isConnected()).to.be.false;
        });

        it("should return false for two unconnected graphs", () => {
           let vertices: Array<[string, any]> = [['a', null], ['b', null], ['c', null], ['d', null], ['e', null]];
           let edges: [[string, string]] = [
               ['a', 'b'],
               ['c', 'b'],
               ['d', 'e']
           ];

           let g = new Graph(vertices, edges);
           expect(g.isConnected()).to.be.false;
        });

        it("should return true for connected graphs", () => {

            let edges: [[string, string]] = [
                ['a', 'b'],
                ['b', 'c'],
                ['b', 'e'],
                ['e', 'f']
            ];

            let g = new Graph(null, edges, VertexMissing.CreateVertex);
            expect(g.isConnected()).to.be.true;
        });
    });

    describe("topSort", () => {
        it("should return empty list for empty graphs", () => {
            let g = new Graph();
            let sorted = g.topSort();
            expect(sorted).to.be.an("Array");
            expect(sorted).to.be.empty;
        });

        it("should return the one element for graphs with one vertex", () => {
            let vertices: Array<[string, any]> = [['a', null]];
            let g = new Graph(vertices);
            expect(g.topSort()).to.deep.equal(['a']);
        });

        it("should return topological sort for graph", () => {
            let edges: [[string, string]] = [
                ['a', 'b'],
                ['b', 'c'],
                ['b', 'e'],
                ['e', 'f']
            ];

            let g = new Graph(null, edges, VertexMissing.CreateVertex);
            let sorted = g.topSort();
            expect(sorted.indexOf('a')).to.be.above(-1);
            expect(sorted.indexOf('a')).to.be.below(sorted.indexOf('b'));
            expect(sorted.indexOf('b')).to.be.below(sorted.indexOf('c'));
            expect(sorted.indexOf('b')).to.be.below(sorted.indexOf('e'));
            expect(sorted.indexOf('e')).to.be.below(sorted.indexOf('f'));

            edges = [
                ['a', 'c'],
                ['b', 'c'],
                ['b', 'e'],
                ['c', 'f'],
                ['e', 'f']
            ];

            g = new Graph(null, edges, VertexMissing.CreateVertex);
            sorted = g.topSort();
            expect(sorted.indexOf('a')).to.be.above(-1);
            expect(sorted.indexOf('b')).to.be.above(-1);
            expect(sorted.indexOf('a')).to.be.below(sorted.indexOf('c'));
            expect(sorted.indexOf('b')).to.be.below(sorted.indexOf('c'));
            expect(sorted.indexOf('b')).to.be.below(sorted.indexOf('e'));
            expect(sorted.indexOf('c')).to.be.below(sorted.indexOf('f'));
        });

        it("should fail when graph has cycles", () => {
            let edges: [[string, string]] = [
                ['a', 'b'],
                ['b', 'c'],
                ['c', 'e'],
                ['e', 'b']
            ];

            let g = new Graph(null, edges, VertexMissing.CreateVertex);
            expect(g.topSort.bind(g)).to.throw("Graph has cycles");
        });
    });

    describe("hasCycles", () => {
        it("should detect cycle in graph", () => {
            const edges: [[string, string]] = [
                ['a', 'b'],
                ['b', 'c'],
                ['d', 'e'],
                ['e', 'c'],
                ['c', 'a']
            ];

            const g = new Graph(null, edges, VertexMissing.CreateVertex);
            expect(g.hasCycles()).to.be.true;
        })
    })

});