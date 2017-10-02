import {expect} from "chai";
import {
    ensureArray, checkMapValueType, incrementString, spreadSelectProps,
    snakeCase, fetchByLoc, cleanupNull, incrementLastLoc, charSeparatedToArray, flatten,
    concatIssues, checkIfConnectionIsValid
} from "./utils";
import {V1WorkflowOutputParameterModel} from "../v1.0/V1WorkflowOutputParameterModel";
import {V1WorkflowInputParameterModel} from "../v1.0/V1WorkflowInputParameterModel";

describe("ensureArray", () => {
    it("should return an array of mismatched objects", () => {
        const test = {
            foo: "bar",
            baz: {
                meow: 3
            },
            myu: {
                id: "grr"
            }
        };
        const arr = ensureArray(test, "id", "type");

        expect(arr).to.have.length(3);
        expect(arr).to.deep.equal(
            [{
                id: "foo",
                type: "bar"
            }, {
                id: "baz",
                meow: 3
            }, {
                id: "myu"
            }]
        );


    });

    it("should return an array from a map of objects", () => {
        const test = {
            foo: {d: "a"},
            bar: {a: "q"}
        };
        const arr = ensureArray(test, "class");

        expect(arr).to.not.be.empty;
        expect(arr).to.have.length(2);

        arr.forEach(i => {
            expect(i).to.haveOwnProperty("class");
        });
    });

    it("should return original array of objects", () => {
        const test = [{foo: 1}, {foo: 2}, {foo: 3}];
        const arr = ensureArray(test, "foo");

        expect(arr).to.deep.equal(test);
    });

    it("should return object array from primitive", () => {
        const test = [1, 2, 4];
        const arr = ensureArray(test, "foo");

        expect(arr).to.deep.equal([
            {foo: 1}, {foo: 2}, {foo: 4}
        ]);
    });

    it("should set inner property if objects are primitives", () => {
        const test = {
            foo: "hello",
            bar: "world"
        };
        const arr = ensureArray(test, "class", "type");

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
    });
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

describe("spreadSelectProps", () => {
    it("should transfer properties to new object", () => {
        let dest = {a: 1, b: 2};
        let source = {c: 4, d: 10};

        spreadSelectProps(source, dest, []);

        expect(dest).to.haveOwnProperty("a");
        expect(dest).to.haveOwnProperty("b");
        expect(dest).to.haveOwnProperty("c");
        expect(dest).to.haveOwnProperty("d");
    });

    it("should transfer only unenumerated properties to new object", () => {
        let dest = {a: 1, b: 2};
        let source = {c: 4, d: 10, b: 33};

        spreadSelectProps(source, dest, ["d", "b"]);

        expect(dest).to.haveOwnProperty("a");
        expect(dest).to.haveOwnProperty("b");
        expect(dest).to.haveOwnProperty("c");
        expect(dest).to.not.haveOwnProperty("d");

        expect(dest.b).to.equal(2);
    });
});

describe("snakeCase", () => {
    it("should convert camelCase to snakeCase", () => {
        expect(snakeCase("camelCasedString")).to.equal("camel_cased_string");
    });

    it("should convert words to snakeCase", () => {
        expect(snakeCase("space separated String")).to.equal("space_separated__string");
    });

    it("should convert mixed camelCase and spaced words to snakeCase", () => {
        const target = snakeCase("space separatedString");
        expect(target).to.equal("space_separated_string");
    });

    it("should convert illegal characters to underscore", () => {
        const target = snakeCase("string/with-illegal.chars");
        expect(target).to.equal("string_with_illegal_chars");
    });
});

describe("fetchByLoc", () => {
    it("should locate simple dot notation", () => {
        const test = {
            hello: {
                world: "meow"
            }
        };

        expect(fetchByLoc(test, "hello.world")).to.equal("meow");
    });

    it("should locate simple array notation", () => {
        const test = [3, 4, 6];

        expect(fetchByLoc(test, "[2]")).to.equal(6);
    });

    it("should locate simple array and dot notation", () => {
        const test = {arr: [3, 4, 6]};

        expect(fetchByLoc(test, "arr[2]")).to.equal(6);
    });

    it("should return undefined if failed to locate", () => {
        const test = {arr: [3, 4, 6]};

        expect(fetchByLoc(test, "arr[4]")).to.be.undefined;
    });

    it("should not throw an error if failed to locate nested", () => {
        const test = {arr: {hello: "meow"}};
        expect(fetchByLoc(test, "arr.foo.baz")).to.be.undefined;
    });

    it("should locate bracket notation for properties", () => {
        const test = {hello: {world: "meow"}};

        expect(fetchByLoc(test, "hello['world']")).to.equal("meow");
    })
});

describe("cleanupNull", () => {
    it("should remove null values", () => {
        const test = {
            a: null,
            b: 3
        };

        const clean = cleanupNull(test);
        expect(Object.keys(clean)).to.have.length(1);
        expect(clean).to.not.haveOwnProperty("a");
        expect(clean).to.haveOwnProperty("b");
    });

    it("should not change values", () => {
        const test = {
            a: null,
            b: 3,
            c: 44
        };

        const clean = cleanupNull(test);
        expect(Object.keys(clean)).to.have.length(2);
        expect(clean).to.not.haveOwnProperty("a");
        expect(clean).to.haveOwnProperty("b");
        expect(clean.b).to.equal(3);
        expect(clean.c).to.equal(44);
    });

    it("should remove undefined values", () => {
        let q = undefined;

        const test = {
            a: q,
            b: 3
        };

        const clean = cleanupNull(test);
        expect(Object.keys(clean)).to.have.length(1);
        expect(clean).to.not.haveOwnProperty("a");
        expect(clean).to.haveOwnProperty("b");
    })
});

describe("checkIfConnectionIsValid", () => {

    it("should be invalid when ource and destination port belong to the same step", () => {

        const parentStep = new V1StepModel();

        const input = new V1WorkflowStepInputModel(null, parentStep);
        const output = new V1WorkflowStepOutputModel(null, parentStep);

        expect(() => checkIfConnectionIsValid(input, output))
            .to.throws("Invalid connection. Source and destination ports belong to the same step");

    });

    it("should be valid for same types or same items", () => {

        const inputFile = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File"
        });

        const outputFile = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: "File"
        });

        const inputFileArray = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "[File]"
        });

        const outputFileArray = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: "[File]"
        });

        expect(checkIfConnectionIsValid(inputFile, outputFile)).equal(true);
        expect(checkIfConnectionIsValid(inputFileArray, outputFileArray)).equal(true);

    });

    it("should be invalid for different types or different items", () => {

        const inputFile = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File"
        });

        const outputString = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: "string"
        });

        const inputFileArray = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File[]"
        });

        const outputStringArray = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: "string[]"
        });

        expect(() => checkIfConnectionIsValid(inputFile, outputString))
            .to.throw(`Invalid connection. Connection type mismatch, attempting to connect "File" to "string"`);

        expect(() => checkIfConnectionIsValid(inputFileArray, outputStringArray))
            .to.throw(`Invalid connection. Connection type mismatch, attempting to connect "File[]" to "string[]"`);

    });

    it("should be valid when source type is equal to destination items", () => {

        const inputFile = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File"
        });

        const outputFileArray = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: "File[]"
        });

        expect(checkIfConnectionIsValid(inputFile, outputFileArray)).equal(true);
    });

    it("should be invalid when destination type is equal to source items", () => {

        const inputFile = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File[]"
        });

        const outputFileArray = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: "File"
        });

        // inputFile to outputFileArray
        expect(() => checkIfConnectionIsValid(inputFile, outputFileArray))
            .to.throws(`Invalid connection. Connection type mismatch, attempting to connect "File[]" to "File"`);

        // outputFileArray to inputFile
        expect(checkIfConnectionIsValid(inputFile, outputFileArray, false)).equal(true);
    });

    it("should be valid when source and destination file-types have an intersection or one or both are empty", () => {

        const inputFile = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File"
        });


        const outputFileArray = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: "File"
        });

        inputFile.fileTypes = [];
        outputFileArray.fileTypes = [];

        expect(checkIfConnectionIsValid(inputFile, outputFileArray)).equal(true);

        inputFile.fileTypes = ["s", "c", "d"];
        expect(checkIfConnectionIsValid(inputFile, outputFileArray)).equal(true);

        inputFile.fileTypes = [];
        outputFileArray.fileTypes = ["B", "c", "d"];
        expect(checkIfConnectionIsValid(inputFile, outputFileArray)).equal(true);

        inputFile.fileTypes = ["D", "c"];
        outputFileArray.fileTypes = ["b", "C", "d"];
        expect(checkIfConnectionIsValid(inputFile, outputFileArray)).equal(true);
    });


    it("should be invalid when source and destination file-types does not have an intersection", () => {

        const inputFile = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File"
        });
        inputFile.fileTypes = ["a"];

        const outputFileArray = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: "File"
        });

        outputFileArray.fileTypes = ["d", "c"];

        expect(() => checkIfConnectionIsValid(inputFile, outputFileArray))
            .to.throws(`Invalid connection. File type mismatch, connecting formats "a" to "d,c"`);
    });

    it("should be valid when source is (File)[] and destination is (union)[]", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File[]"
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: {
                type: "array",
                items: ["File", "null"]
            }
        });

        expect(checkIfConnectionIsValid(input, output)).equal(true);

    });

    it("should be valid when source is object[] and destination is object[]", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: {
                type: "array",
                items: {
                    "items": "string",
                    "type": "array"
                }
            }
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: {
                type: "array",
                items: {
                    "items": "string",
                    "type": "array"
                }
            }
        });

        expect(checkIfConnectionIsValid(input, output)).equal(true);

    });

    it("should be valid when source is object[] and destination is union[]", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: {
                type: "array",
                items: {
                    "items": "string",
                    "type": "array"
                }
            }
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: {
                type: "array",
                items: ["File", "null"]
            }
        });

        expect(checkIfConnectionIsValid(input, output)).equal(true);

    });

    it("should be valid when source is union[] and destination is object[]", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: {
                type: "array",
                items: ["File", "null"]
            }
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: {
                type: "array",
                items: {
                    "items": "string",
                    "type": "array"
                }
            }
        });

        expect(checkIfConnectionIsValid(input, output)).equal(true);

    });

    it("should be valid when source is File and destination is union[]", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File"
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: {
                type: "array",
                items: ["File", "null"]
            }
        });

        expect(checkIfConnectionIsValid(input, output)).equal(true);
    });

    it("should be invalid when source is object[] and destination is File", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: {
                type: "array",
                items: {
                    "items": "string",
                    "type": "array"
                }
            }
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: "File"
        });

        expect(() => checkIfConnectionIsValid(input, output))
            .to.throw(`Invalid connection. Connection type mismatch, attempting to connect "object[]" to "File"`);
    });

    it("should be invalid when source is union[] and destination is File", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: {
                type: "array",
                items: ["File", "null"]
            }
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: "File"
        });

        expect(() => checkIfConnectionIsValid(input, output))
            .to.throw(`Invalid connection. Connection type mismatch, attempting to connect "union[]" to "File"`);
    });

    it("should be invalid when source is File and destination is object[]", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File"
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: {
                type: "array",
                items: {
                    "items": "string",
                    "type": "array"
                }
            }
        });

        expect(() => checkIfConnectionIsValid(input, output))
            .to.throw(`Invalid connection. Connection type mismatch, attempting to connect "File" to "object[]"`);
    });

    it("should be invalid when source is File[] and destination is object[]", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File[]"
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: {
                type: "array",
                items: {
                    "items": "string",
                    "type": "array"
                }
            }
        });

        expect(() => checkIfConnectionIsValid(input, output))
            .to.throw(`Invalid connection. Connection type mismatch, attempting to connect "File[]" to "object[]"`);
    });

    it("should be invalid when source is File and destination is record", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: "File"
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: {
                type: "record",
                fields: [
                    {
                        "name": "description",
                        "type": "string"
                    }]
            }
        });

        expect(() => checkIfConnectionIsValid(input, output))
            .to.throw(`Invalid connection. Connection type mismatch, attempting to connect "File" to "record"`);
    });

    it("should be valid when source is (record)[] and destination is (object)[]", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: {
                type: "array",
                items: {
                    type: "record",
                    fields: [{
                        name: "files",
                        type: "File[]"
                    }]
                }
            }
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: {
                type: "array",
                items: {
                    "items": "string",
                    "type": "array"
                }
            }
        });

        expect(checkIfConnectionIsValid(input, output)).equal(true);
    });

    it("should be valid when source is object[] and destination is record[]", () => {

        const input = new V1WorkflowInputParameterModel({
            id: "pointA",
            type: {
                type: "array",
                items: {
                    "items": "string",
                    "type": "array"
                }
            }
        });

        const output = new V1WorkflowOutputParameterModel({
            id: "pointB",
            type: {
                type: "array",
                items: {
                    type: "record",
                    fields: [{
                        name: "files",
                        type: "File[]"
                    }]
                }
            }
        });

        expect(checkIfConnectionIsValid(input, output)).equal(true);
    });

});

describe("incrementLastLoc", () => {
    it("should return the last location with an incremented index", () => {
        const loc = incrementLastLoc([{loc: "items[0]"}, {loc: "items[1]"}], "items");
        expect(loc).to.equal("items[2]");
    });

    it("should return prefix[0] when array is empty", () => {
        const loc = incrementLastLoc([], "items");
        expect(loc).to.equal("items[0]");
    });

    it("should return null if loc isn't incrementable", () => {
        const loc = incrementLastLoc([{loc: "items.one"}, {loc: "items.two"}], "items");
        expect(loc).to.be.null;
    })
});

describe("charSeparatedToArray", () => {
    it("should return single string wrapped in array when splitting by whitespace", () => {
        const arr = charSeparatedToArray("string", /\s+/);
        expect(arr).to.deep.equal(["string"]);
    })
});

describe("flatten", () => {
    it("should flatten nested array", () => {
        const arr = [1, 2, [3, 4, [5, [6]]]];
        const flat = flatten(arr);

        expect(flat).to.deep.equal([1, 2, 3, 4, 5, 6]);
    })
});

describe("concatKeyArrays", () => {
   it("should concat two objects with arbitrary arrays", () => {
       const base = {b: [1, 2], c: [3]};
       const add = {b: [4]};

       const combine = concatIssues(base, add, false);
       expect(combine).to.deep.equal({b: [1, 2, 4], c: [3]});
   });

   it("should add null values to base", () => {
       const base = {b: [1, 2], c: [3]};
       const add = {d: null};

       const combine = concatIssues(base, add, false);
       expect(combine).to.deep.equal({b: [1, 2], c: [3], d: null});
   });

   it("should add an array property to the base object", () => {
       const base = {b: [1, 2], c: [3]};
       const add = {d: [4]};

       const combine = concatIssues(base, add, false);
       expect(combine).to.deep.equal({b: [1, 2], c: [3], d: [4]});
   });

   it("should override array of base with null", () => {
       const base = {b: [1, 2], c: [3]};
       const add = {b: null};

       const combine = concatIssues(base, add, false);
       expect(combine).to.deep.equal({b: null, c: [3]});
   });

    it("should not duplicate existing values", () => {
        const base = {b: [1, 2], c: [3]};
        const add = {b: [2]};

        const combine = concatIssues(base, add,  false);
        expect(combine).to.deep.equal({b: [1, 2], c: [3]});
    });
});
