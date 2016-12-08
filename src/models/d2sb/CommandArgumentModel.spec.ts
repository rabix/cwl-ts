import {expect} from "chai";
import {CommandArgumentModel} from "./CommandArgumentModel";

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
       });

       it("Should handle arg that has expression", () => {
           let arg  = new CommandArgumentModel({prefix: "--prefix", valueFrom:{
               "class": "Expression",
               script: "3 + 3",
               engine: ""
           }});
           let part = arg.getCommandPart();
           expect(part.value).to.equal("--prefix 6");
       });

       it("Should handle arg that has expression with inputs", () => {
           const arg = new CommandArgumentModel({valueFrom:{
               "class": "Expression",
               script: "$job.file.path",
               engine: ""
           }});
           const part = arg.getCommandPart({file: {path: "foo.bar.baz"}});
           expect(part.value).to.equal("foo.bar.baz");
       });
   });
});