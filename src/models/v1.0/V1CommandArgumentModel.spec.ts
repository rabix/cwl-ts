import {V1CommandArgumentModel} from "./V1CommandArgumentModel";
import {expect} from "chai";
describe("V1CommandArgumentModel", () => {
    describe("serialize", () => {
        it("should serialize binding", () => {
            const data = {
                prefix: "--pref",
                position: 3,
                valueFrom: "string"
            };

            const arg = new V1CommandArgumentModel(data);

            expect(arg.hasBinding).to.be.true;
            expect(arg.prefix).to.equal(data.prefix);
            expect(arg.position).to.equal(data.position);
            expect(arg.valueFrom.serialize()).to.equal(data.valueFrom);

            expect(arg.serialize()).to.deep.equal(data);
        });

        it("should serialize string", () => {
            const data = "argValue";

            const arg = new V1CommandArgumentModel(data);

            expect(arg.primitive.serialize()).to.equal(data, "Did not deserialize primitive");
            expect(arg.hasBinding).to.be.false;

            expect(arg.serialize()).to.deep.equal(data, "Did not serialize primitive");
        });
    });
});