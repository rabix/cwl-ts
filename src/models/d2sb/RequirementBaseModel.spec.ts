import {expect} from "chai";
import {RequirementBaseModel} from "./RequirementBaseModel";
import {ExpressionModel} from "./ExpressionModel";
import {ProcessRequirement} from "../../mappings/d2sb/ProcessRequirement";

describe("RequirementBaseModel", () => {
    describe("serialize", () => {
        it("should serialize object with class and arbitrary value", () => {
            const obj = {
                "class": "helloWorld",
                value: 344
            };
            const req = new RequirementBaseModel(obj);

            expect(req.value).to.equal(344);
            expect(req.serialize()).to.deep.equal(obj);
        });

        it("should serialize object with class and expression value", () => {
            const obj = {
                "class": "helloWorld",
                value: {
                    "class": "Expression",
                    engine: "#cwl-js-engine",
                    script: "44"
                }
            };
            const req = new RequirementBaseModel(obj);

            expect(req.value).to.be.instanceof(ExpressionModel);
            expect(req.serialize()).to.deep.equal(obj);
        });

        it("should serialize object with class and string value", () => {
            const obj = {
                "class": "helloWorld",
                value: "Some string value"
            };
            const req = new RequirementBaseModel(obj);

            expect(req.value).to.be.instanceof(ExpressionModel);
            expect(req.serialize()).to.deep.equal(obj);
        });
    });

    describe("updateValue", () => {
        it("should update value that's an expression", () => {
            const obj = {
                "class": "helloWorld",
                value: "Some string value"
            };
            const req = new RequirementBaseModel(obj);

            req.updateValue(new ExpressionModel("", {
                    "class": "Expression",
                    engine: "",
                    script: "hello"
                }
            ));

            expect(req.value).to.be.instanceof(ExpressionModel);
            expect(req.serialize()).to.deep.equal({
                "class": "helloWorld",
                value: {
                    "class": "Expression",
                    engine: "",
                    script: "hello"
                }
            });
        });

        it("should update value that's arbitrary", () => {
            const obj = {
                "class": "helloWorld",
                value: "Some string value"
            };
            const req = new RequirementBaseModel(obj);

            req.updateValue({
                random: "Object",
                and: "random values"
            });

            expect(req.value).to.not.be.instanceof(ExpressionModel);
            expect(req.serialize()).to.deep.equal({
                "class": "helloWorld",
                value: {
                    random: "Object",
                    and: "random values"
                }
            });
        });

        it("Should serialize requirement with arbitrary class/value", () => {
            const data = {
                "class": "helloWorld",
                value: {
                    random: "Object",
                    and: "random values"
                }
            };

            const req = new RequirementBaseModel(data);

            expect(req.serialize()).to.deep.equal(data);
        });

        it("Should serialize requirement that is an arbitrary object", () => {
            const data = {
                attr: {
                    random: "Object",
                    and: "random values"
                }
            };

            const req = new RequirementBaseModel(data);

            expect(req.serialize()).to.deep.equal(data);
        });


        it("Should serialize requirement that is an arbitrary string", () => {
            const data = "string value";

            const req = new RequirementBaseModel(data);

            expect(req.serialize()).to.deep.equal(data);
        });
    });
});