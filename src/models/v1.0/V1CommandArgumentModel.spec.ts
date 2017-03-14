import {V1CommandArgumentModel} from "./V1CommandArgumentModel";
import {expect} from "chai";
describe("V1CommandArgumentModel", () => {
    // describe("getCommandPart", () => {
    //     it("Should handle arg with just a prefix", () => {
    //         let arg  = new SBDraft2CommandArgumentModel({prefix: "--p"});
    //         let part = arg.getCommandPart();
    //         expect(part.value).to.equal("--p");
    //     });
    //
    //     it("Should handle arg with a prefix and value from", () => {
    //         let arg  = new SBDraft2CommandArgumentModel({prefix: "--p", valueFrom: "value"});
    //         let part = arg.getCommandPart();
    //         expect(part.value).to.equal("--p value")
    //     });
    //
    //     it("Should handle arg that is a string", () => {
    //         let arg  = new SBDraft2CommandArgumentModel("--prefix");
    //         let part = arg.getCommandPart();
    //         expect(part.value).to.equal("--prefix");
    //     });
    //
    //     it("Should handle arg that has expression", () => {
    //         let arg  = new SBDraft2CommandArgumentModel({prefix: "--prefix", valueFrom:"$(3 + 3)"});
    //         let part = arg.getCommandPart();
    //         expect(part.value).to.equal("--prefix 6");
    //     });
    //
    //     it("Should handle arg that has expression with inputs", () => {
    //         const arg = new SBDraft2CommandArgumentModel({valueFrom: "$(inputs.file.path)"});
    //         const part = arg.getCommandPart({file: {path: "foo.bar.baz"}});
    //         expect(part.value).to.equal("foo.bar.baz");
    //     });
    // });
});