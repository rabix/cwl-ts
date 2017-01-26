import {Document} from "./Document";
import {expect} from "chai";

describe("Document", () => {
    it("Should load", () => {
        let d = Document.load("a: 5\n#comment\nb: [\"a\", 4]");      
    });
})
