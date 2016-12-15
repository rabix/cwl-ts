import {CommandArgumentModel} from "./CommandArgumentModel";
import {expect} from "chai";
describe("CommandArgumentModel v1", () => {
    describe("getCommandPart", () => {
        it("Should handle arg with just a prefix", () => {
            let arg  = new CommandArgumentModel({prefix: "--p"});
            let part = arg.getCommandPart();
            expect(part.value).to.equal("--p");
        });

        it("Should handle arg with a prefix and value from", () => {
            let arg  = new CommandArgumentModel({prefix: "--p", valueFrom: "value"});
            let part = arg.getCommandPart();
            expect(part.value).to.equal("--p value")
        });

        it("Should handle arg that is a string", () => {
            let arg  = new CommandArgumentModel("--prefix");
            let part = arg.getCommandPart();
            expect(part.value).to.equal("--prefix");
        });

        it("Should handle arg that has expression", () => {
            let arg  = new CommandArgumentModel({prefix: "--prefix", valueFrom:"$(3 + 3)"});
            let part = arg.getCommandPart();
            expect(part.value).to.equal("--prefix 6");
        });

        it("Should handle arg that has expression with inputs", () => {
            const arg = new CommandArgumentModel({valueFrom: "$(inputs.file.path)"});
            const part = arg.getCommandPart({file: {path: "foo.bar.baz"}});
            expect(part.value).to.equal("foo.bar.baz");
        });
    });
});