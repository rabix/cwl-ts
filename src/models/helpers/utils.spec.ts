import {expect} from "chai";
import {ensureArray, checkMapValueType, incrementString} from "./utils";

describe("ensureArray", () => {
    it("should return an array from a map of objects", () => {
        const test = {
            foo: {d: "a"},
            bar: {a: "q"}
        };
        const arr  = ensureArray(test, "class");

        expect(arr).to.not.be.empty;
        expect(arr).to.have.length(2);

        arr.forEach(i => {
            expect(i).to.haveOwnProperty("class");
        });
    });

    it("should return original array of objects", () => {
        const test = [{foo: 1}, {foo: 2}, {foo: 3}];
        const arr  = ensureArray(test, "foo");

        expect(arr).to.deep.equal(test);
    });

    it("should return object array from primitive", () => {
        const test = [1, 2, 4];
        const arr  = ensureArray(test, "foo");

        expect(arr).to.deep.equal([
            {foo: 1}, {foo: 2}, {foo: 4}
        ]);
    });

    it("should set inner property if objects are primitives", () => {
        const test = {
            foo: "hello",
            bar: "world"
        };
        const arr  = ensureArray(test, "class", "type");

        expect(arr).to.not.be.empty;
        expect(arr).to.have.length(2);

        arr.forEach(i => {
            expect(i).to.haveOwnProperty("class");
            expect(i).to.haveOwnProperty("type");
        });

        expect(arr[0]["class"]).to.equal("foo");
        expect(arr[1]["class"]).to.equal("bar");

        expect(arr[0]["type"]).to.equal("hello");
        expect(arr[1]["type"]).to.equal("world");
    });

    it("should wrap a primitive value in an array", () => {
        const test = "simple string";
        const arr = ensureArray(<any> test);

        expect(arr).to.have.length(1);
        expect(arr).to.deep.equal(["simple string"]);

    })
});

describe("checkMapValueType", () => {
    it("should identify map of strings", () => {
        const test = {
            foo: "bar",
            baz: "maz"
        };

        expect(checkMapValueType(test)).to.equal("string");
    });

    it("should identify map of numbers", () => {
        const test = {
            foo: 3,
            baz: 4
        };

        expect(checkMapValueType(test)).to.equal("number");
    });

    it("should identify map of objects", () => {
        const test = {
            foo: {},
            baz: {}
        };

        expect(checkMapValueType(test)).to.equal("object");
    });

    it("should identify map of nulls", () => {
        const test = {
            foo: null,
            baz: null
        };

        expect(checkMapValueType(test)).to.equal("null");
    });

    it("should identify map of undefineds", () => {
        const test = {
            foo: undefined,
            baz: undefined
        };

        expect(checkMapValueType(test)).to.equal("undefined");
    });

    it("should identify map of booleans", () => {
        const test = {
            foo: true,
            baz: false
        };

        expect(checkMapValueType(test)).to.equal("boolean");
    });

    it("should identify map of mismatched types", () => {
        const test = {
            foo: true,
            baz: 3
        };

        expect(checkMapValueType(test)).to.equal("mismatch");
    });
});

describe("incrementString", () => {
    it("should increment a string ending in a number", () => {
        expect(incrementString("test1")).to.equal("test2");
    });

    it("should increment the last number of a string", () => {
        expect(incrementString("test3_34")).to.equal("test3_35");
    });

    it("should add _1 if string doesn't end in a number", () => {
        expect(incrementString("test")).to.equal("test_1");
    })
});