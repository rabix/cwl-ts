import {expect} from "chai";
import {ParameterTypeModel} from "./ParameterTypeModel";
import {SBDraft2CommandInputParameterModel} from "../d2sb/SBDraft2CommandInputParameterModel";
import {V1CommandInputParameterModel} from "../v1.0/V1CommandInputParameterModel";
import {V1WorkflowInputParameterModel} from "../v1.0/V1WorkflowInputParameterModel";

describe("ParameterTypeModel", () => {
    describe("fields", () => {
        it("should create nested records for SBDraft2CommandInputParameterModel", () => {
            const data = [{
                type: "record",
                name: "parent",
                fields: [
                    {
                        name: "child",
                        type: [{
                            name: "child",
                            type: "record",
                            fields: [
                                {
                                    name: "grandchild",
                                    type: ["string"]
                                }
                            ]
                        }]
                    }
                ]
            }];
            const type = new ParameterTypeModel(data, SBDraft2CommandInputParameterModel, "");

            expect(type.type).to.equal("record");
            expect(type.fields[0].id).to.equal("child");
            expect(type.fields[0].type.type).to.equal("record");
            expect(type.fields[0].type.fields[0].id).to.equal("grandchild");

            expect(type.serialize()).to.deep.equal(data);
        });

        it("should create nested records for V1CommandInputParameterModel", () => {
            const data = [{
                type: "record",
                name: "parent",
                fields: [
                    {
                        name: "child",
                        type: {
                            name: "child",
                            type: "record",
                            fields: [
                                {
                                    name: "grandchild",
                                    type: "string"
                                }
                            ]
                        }
                    }
                ]
            }];
            const type = new ParameterTypeModel(data, V1CommandInputParameterModel, "");

            expect(type.type).to.equal("record");
            expect(type.fields[0].id).to.equal("child");
            expect(type.fields[0].type.type).to.equal("record");
            expect(type.fields[0].type.fields[0].id).to.equal("grandchild");

            expect(type.serialize()).to.deep.equal(data);
        });

        it("should create nested records for V1WorkflowInputParameterModel", () => {
            const data = {
                type: "record",
                name: "parent",
                fields: [
                    {
                        name: "child",
                        type: {
                            name: "child",
                            type: "record",
                            fields: [
                                {
                                    name: "grandchild",
                                    type: "string"
                                }
                            ]
                        }
                    }
                ]
            };
            const type = new ParameterTypeModel(data, V1WorkflowInputParameterModel, "");

            expect(type.type).to.equal("record");
            expect(type.fields[0].id).to.equal("child");
            expect(type.fields[0].type.type).to.equal("record");
            expect(type.fields[0].type.fields[0].id).to.equal("grandchild");

            expect(type.serialize("v1.0")).to.deep.equal(data);
        });

        it("should create optional enum", () => {
            const data = ["null", {
                type: "enum",
                symbols: ["one", "two", "three"],
                name: "enum"

            }];

            const type = new ParameterTypeModel(data, V1CommandInputParameterModel);

            expect(type.type).to.equal("enum");
            expect(type.symbols).to.deep.equal(["one", "two", "three"]);
            expect(type.serialize("v1.0")).to.deep.equal(data);
        });
    });

    describe("arrays", () => {
        it("should create nested array", () => {
            const data = {
                type: "array",
                items: {
                    type: "array",
                    items: "string"
                }
            };

            const type = new ParameterTypeModel(data);

            expect(type.serialize("v1.0")).to.deep.equal(data);
        });

        it("should create array of items null and string", () => {
            const data = {
                type: "array",
                items: ["null", "string"]
            };

            const type = new ParameterTypeModel(data);

            expect(type.serialize("v1.0")).to.deep.equal(data);
        });

        it("should create array of union types", () => {
            const data = {
                type: "array",
                items: ["null", "string", "File", "long"]
            };

            const type = new ParameterTypeModel(data);

            expect(type.serialize("v1.0")).to.deep.equal(data);
        });

        it("should create nested array of union types", () => {
            const data = {
                type: "array",
                items: {
                    type: "array",
                    items: ["null", "string", "File", "long"]
                }
            };

            const type = new ParameterTypeModel(data);

            expect(type.serialize("v1.0")).to.deep.equal(data);
        });
    });
});
