import {CommandArgumentModel} from "./CommandArgumentModel";
import {expect} from "chai";
describe("CommandArgumentModel", () => {
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
        })
    });
});