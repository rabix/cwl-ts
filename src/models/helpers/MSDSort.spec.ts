import {MSDSort} from "./MSDSort";
import {CommandLinePart} from "./CommandLinePart";
import {expect} from "chai";

describe("MSDSort", () => {
    it("Should sort an array of equal length sorting keys", () => {
        const array = [
            new CommandLinePart('c', [1, 0], "input"),
            new CommandLinePart('b', [0, 2], "input"),
            new CommandLinePart('a', [0, 1], "input"),
            new CommandLinePart('d', [3, 0], "input")
        ];

        MSDSort.sort(array);

        expect(array.map(part => part.value).join('')).to.equal('abcd');
    });

    it("Should sort array of variable length sorting keys", () => {
        const array = [
            new CommandLinePart('c', [1], "input"),
            new CommandLinePart('b', [0, 2], "input"),
            new CommandLinePart('a', [0, 1], "input"),
            new CommandLinePart('d', [3], "input")
        ];

        MSDSort.sort(array);

        expect(array.map(part => part.value).join('')).to.equal('abcd');
    });


    it("Should sort array by lower level sorting keys", () => {
        const array = [
            new CommandLinePart('c', [0, 1, 10], "input"),
            new CommandLinePart('b', [0, 2], "input"),
            new CommandLinePart('a', [0, 1], "input"),
            new CommandLinePart('d', [3], "input")
        ];

        MSDSort.sort(array);

        expect(array.map(part => part.value).join('')).to.equal('acbd');
    });

    it("Should sort array with mix string number sorting keys", () => {
        const array = [
            new CommandLinePart('c', [0, "aba", 10], "input"),
            new CommandLinePart('f', [0, "aba", 9], "input"),
            new CommandLinePart('b', [0, "bbb"], "input"),
            new CommandLinePart('a', [0, "abc"], "input"),
            new CommandLinePart('d', [3], "input")
        ];

        MSDSort.sort(array);

        expect(array.map(part => part.value).join('')).to.equal('fcabd');
    });

});