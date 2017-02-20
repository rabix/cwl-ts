import {TypeResolver} from "./TypeResolver";
import {expect} from "chai";

describe("TypeResolver", () => {
    describe("resolveType", () => {
        it('Should resolve simple string type for required single item', () => {
            let resolved = TypeResolver.resolveType("string");
            expect(resolved).to.not.be.undefined;
            expect(resolved.type).to.be.equal("string");
            expect(resolved.isNullable).to.be.false;
            expect(resolved.items).to.be.null;
        });

        it('Should resolve type shorthand for required array', () => {
            let resolved = TypeResolver.resolveType("string[]");
            expect(resolved).to.not.be.undefined;
            expect(resolved.type).to.be.equal("array");
            expect(resolved.items).to.be.equal("string");
            expect(resolved.isNullable).to.be.false;
        });

        it("Should resolve type shorthand for optional single item", () => {
            let resolved = TypeResolver.resolveType("string?");
            expect(resolved).to.not.be.undefined;
            expect(resolved.type).to.be.equal("string");
            expect(resolved.items).to.be.null;
            expect(resolved.isNullable).to.be.true;
        });

        it("Should resolve type shorthand for optional array", () => {
            let resolved = TypeResolver.resolveType("string[]?");
            expect(resolved).to.not.be.undefined;
            expect(resolved.type).to.be.equal("array");
            expect(resolved.items).to.be.equal("string");
            expect(resolved.isNullable).to.be.true;
        });

        it("Should resolve optional union type of primitive type", () => {
            let resolved = TypeResolver.resolveType(["null", "string"]);
            expect(resolved).to.not.be.undefined;
            expect(resolved.type).to.be.equal("string");
            expect(resolved.items).to.be.null;
            expect(resolved.isNullable).to.be.true;
        });

        it("Should resolve optional union type of primitive type", () => {
            let resolved = TypeResolver.resolveType(["string", "null"]);
            expect(resolved).to.not.be.undefined;
            expect(resolved.type).to.be.equal("string");
            expect(resolved.items).to.be.null;
            expect(resolved.isNullable).to.be.true;
        });

        it("Should resolve required primitive type defined as union", () => {
            let resolved = TypeResolver.resolveType(["string"]);
            expect(resolved).to.not.be.undefined;
            expect(resolved.type).to.be.equal("string");
            expect(resolved.isNullable).to.be.false;
            expect(resolved.items).to.be.null;
        });

        it("Should resolve complex array type", () => {
            let resolved = TypeResolver.resolveType({type: "array", items: "string"});
            expect(resolved).to.not.be.undefined;
            expect(resolved.type).to.be.equal("array");
            expect(resolved.items).to.be.equal("string");
            expect(resolved.isNullable).to.be.false;
        });

        it("Should resolve complex record type", () => {
            let resolved = TypeResolver.resolveType({
                type: "record",
                fields: [{id: "hello", type: "string"}]
            });
            expect(resolved).to.not.be.undefined;
            expect(resolved.type).to.be.equal("record");
            expect(resolved.items).to.be.null;
            expect(resolved.fields).to.have.lengthOf(1);
            expect(resolved.isNullable).to.be.false;
        });

        it("Should resolve complex enum type", () => {
            let resolved = TypeResolver.resolveType({type: "enum", symbols: ["hello", "enum"]});
            expect(resolved).to.not.be.undefined;
            expect(resolved.type).to.be.equal("enum");
            expect(resolved.symbols).to.have.lengthOf(2);
            expect(resolved.items).to.be.null;
            expect(resolved.fields).to.be.null;
            expect(resolved.isNullable).to.be.false;
        });

        it("Should resolve complex array of enum type", () => {
            let resolved = TypeResolver.resolveType({
                type: "array",
                items: {type: "enum", symbols: ["hello", "enum"]}
            });
            expect(resolved).to.not.be.undefined;
            expect(resolved.type).to.equal("array");
            expect(resolved.symbols).to.have.lengthOf(2);
            expect(resolved.items).to.equal("enum");
            expect(resolved.fields).to.be.null;
            expect(resolved.isNullable).to.be.false;
        });

        it("Should resolve complex array of record type", () => {
            let resolved = TypeResolver.resolveType({
                type: "array",
                items: {
                    type: "record",
                    fields: [
                        {
                            name: "meow",
                            type: "string"
                        }
                    ]
                }
            });
            expect(resolved).to.not.be.undefined;
            expect(resolved.type).to.equal("array");
            expect(resolved.fields).to.have.lengthOf(1);
            expect(resolved.items).to.equal("record");
            expect(resolved.symbols).to.be.null;
            expect(resolved.isNullable).to.be.false;
        });

        it("Should resolve optional complex record type defined as union", () => {
            let resolved = TypeResolver.resolveType(['null', {
                type: "record",
                fields: [{id: "hello", type: "string"}]
            }]);
            expect(resolved).to.not.be.undefined;
            expect(resolved.type).to.be.equal("record");
            expect(resolved.items).to.be.null;
            expect(resolved.fields).to.have.length(1);
            expect(resolved.isNullable).to.be.true;
        });

        it("Should resolve required complex record type defined as union", () => {
            let resolved = TypeResolver.resolveType([{
                type: "record",
                fields: [{id: "hello", type: "string"}]
            }]);
            expect(resolved).to.not.be.undefined;
            expect(resolved.type).to.be.equal("record");
            expect(resolved.items).to.be.null;
            expect(resolved.fields).to.have.length(1);
            expect(resolved.isNullable).to.be.false;
        });

        it("Should resolve array of records type", () => {
            let resolved = TypeResolver.resolveType([{
                type: "record",
                fields: [{id: "hello", type: "string"}]
            }]);
            expect(resolved).to.not.be.undefined;
            expect(resolved.type).to.be.equal("record");
            expect(resolved.items).to.be.null;
            expect(resolved.fields).to.have.length(1);
            expect(resolved.isNullable).to.be.false;
        });

        it("Should throw an exception for an unexpected complex type", () => {
            expect(function () {
                TypeResolver.resolveType({type: "baz"})
            }).to.throw("unmatched complex type, expected 'enum', 'array', or 'record', got 'baz'");
        });

        it("Should return optional input of no type for null", () => {
            let resolved = TypeResolver.resolveType(null);
            expect(resolved.isNullable).to.be.true;
            expect(resolved.type).to.be.null;
        });

        it("Should throw an exception for object without type field", () => {
            expect(function () {
                TypeResolver.resolveType({notType: "foo"})
            }).to.throw('expected complex object with type field, instead got {"notType":"foo"}');
        });

        it("Should return inputBinding on items if it exists", () => {
            let resolved = TypeResolver.resolveType([{
                type: "array",
                items: "string",
                inputBinding: {
                    prefix: '-p'
                }
            }]);
            expect(resolved).to.not.be.undefined;
            expect(resolved.type).to.be.equal("array");
            expect(resolved.items).to.equal("string");
            expect(resolved.typeBinding).to.not.be.null;
            expect(resolved.typeBinding).to.have.property('prefix');
            expect(resolved.typeBinding.prefix).to.equal("-p");
            expect(resolved.isNullable).to.be.false;
        })
    });

    describe("doesTypeMatch", () => {
        it("Should match types correctly", () => {
            expect(TypeResolver.doesTypeMatch("string", "blah blah")).to.be.true;
            expect(TypeResolver.doesTypeMatch(null, "blah blah"), "should always return true for null").to.be.true;
            expect(TypeResolver.doesTypeMatch("boolean", true), "boolean should be true").to.be.true;
            expect(TypeResolver.doesTypeMatch("enum", "hello"), "boolean should be true").to.be.true;
            expect(TypeResolver.doesTypeMatch("array", []), "array should be []").to.be.true;
            expect(TypeResolver.doesTypeMatch("array", {}), "array shouldn't be a hash literal").to.be.false;
            expect(TypeResolver.doesTypeMatch("record", []), "record shouldn't be an array").to.be.false;
            expect(TypeResolver.doesTypeMatch("float", 323), "float should be a number").to.be.true;
            expect(TypeResolver.doesTypeMatch("long", 323), "long should be a number").to.be.true;
            expect(TypeResolver.doesTypeMatch("double", 323), "double should be a number").to.be.true;
            expect(TypeResolver.doesTypeMatch("int", 323), "int should be a number").to.be.true;
            expect(TypeResolver.doesTypeMatch("int", "hello"), "int shouldn't be a string").to.be.false;
        });
    });

    describe("serializeType", () => {
        it("should resolve a primitive type that is required", () => {
            const resolved   = TypeResolver.resolveType(["string"]);
            const serialized = TypeResolver.serializeType(resolved);

            expect(serialized).to.deep.equal(["string"]);
        });

        it("should resolve a primitive type that is not required", () => {
            const resolved   = TypeResolver.resolveType(["null", "string"]);
            const serialized = TypeResolver.serializeType(resolved);

            expect(serialized).to.deep.equal(["null", "string"]);
        });

        it("should resolve a complex array type that is required", () => {
            const resolved   = TypeResolver.resolveType({type: "array", items: "File"});
            const serialized = TypeResolver.serializeType(resolved);

            expect(serialized).to.deep.equal([{type: "array", items: "File"}]);
        });

        it("should resolve a complex array type that is not required", () => {
            const resolved   = TypeResolver.resolveType(["null", {type: "array", items: "File"}]);
            const serialized = TypeResolver.serializeType(resolved);

            expect(serialized).to.deep.equal(["null", {type: "array", items: "File"}]);
        });

        it("should resolve complex enum type that is required", () => {
            const resolved   = TypeResolver.resolveType({
                type: "enum",
                name: "enum",
                symbols: ["one", "two"]
            });
            const serialized = TypeResolver.serializeType(resolved);

            expect(serialized).to.deep.equal([{
                type: "enum",
                name: "enum",
                symbols: ["one", "two"]
            }]);
        });

        it("should resolve complex enum type that is not required", () => {
            const resolved   = TypeResolver.resolveType(["null", {
                type: "enum",
                name: "enum",
                symbols: ["one", "two"]
            }]);
            const serialized = TypeResolver.serializeType(resolved);

            expect(serialized).to.deep.equal(["null", {
                type: "enum",
                name: "enum",
                symbols: ["one", "two"]
            }]);
        });

        it("should resolve complex record type that is required", () => {
            const resolved   = TypeResolver.resolveType({
                type: "record",
                name: "rec",
                fields: [
                    {id: "f1", type: "string"},
                    {id: "f2", type: "File"}
                ]
            });
            const serialized = TypeResolver.serializeType(resolved);

            expect(serialized).to.deep.equal([{
                type: "record",
                name: "rec",
                fields: [
                    {id: "f1", type: "string"},
                    {id: "f2", type: "File"}
                ]
            }]);
        });

        it("should resolve complex record type that is not required", () => {
            const resolved   = TypeResolver.resolveType(["null", {
                type: "record",
                name: "rec",
                fields: [
                    {id: "f1", type: "string"},
                    {id: "f2", type: "File"}
                ]
            }]);
            const serialized = TypeResolver.serializeType(resolved);

            expect(serialized).to.deep.equal(["null", {
                type: "record",
                name: "rec",
                fields: [
                    {id: "f1", type: "string"},
                    {id: "f2", type: "File"}
                ]
            }]);
        });

        it("should resolve shorthand for array", () => {
            const resolved   = TypeResolver.resolveType("string[]");
            const serializedV1 = TypeResolver.serializeType(resolved, "v1.0");
            const serializedD2 = TypeResolver.serializeType(resolved);

            expect(serializedV1).to.deep.equal("string[]");
            expect(serializedD2).to.deep.equal([{type: "array", items: "string"}]);
        });

        it("should resolve shorthand for primitive that is not required", () => {
            const resolved   = TypeResolver.resolveType("string?");
            const serializedV1 = TypeResolver.serializeType(resolved, "v1.0");
            const serializedD2 = TypeResolver.serializeType(resolved);

            expect(serializedV1).to.deep.equal("string?");
            expect(serializedD2).to.deep.equal(["null", "string"]);
        });

        it("should resolve shorthand for array that is not required", () => {
            const resolved     = TypeResolver.resolveType("string[]?");
            const serializedV1 = TypeResolver.serializeType(resolved, "v1.0");
            const serializedD2 = TypeResolver.serializeType(resolved);

            expect(serializedV1).to.deep.equal("string[]?");
            expect(serializedD2).to.deep.equal(["null", {type: "array", items: "string"}]);
        });

        it("should serialize array of enum", () => {
            const data = [{type: "array", items: {type: "enum", symbols: ["foo", "bar"]}}];
            const resolved = TypeResolver.resolveType(data);
            const serialized = TypeResolver.serializeType(resolved);

            expect(serialized).to.deep.equal(data);
        });

        it("should serialize array of records", () => {
            const data = [{type: "array", items: {type: "record", fields: [{name: "a", type: "string"}]}}];
            const resolved = TypeResolver.resolveType(data);
            const serialized = TypeResolver.serializeType(resolved);

            expect(serialized).to.deep.equal(data);
        });
    });
});

