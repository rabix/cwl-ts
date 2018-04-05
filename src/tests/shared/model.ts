import {expect} from "chai";
import {CommandLineToolModel, WorkflowModel} from "../../models/generic";

export function testNamespaces<T extends CommandLineToolModel | WorkflowModel>(modelConstructor: { new(...args): T }) {

    describe("namespaces", () => {

        it("should be accepted as valid cwl properties", () => {
            const model = new modelConstructor({
                $namespaces: {
                    rabix: "https://rabix.io"
                }
            } as any);
            expect(model).to.have.property("namespaces");
            expect(model.customProps).to.not.have.property("$namespaces");
        });

        it("should be serialized to root", () => {
            const model = new modelConstructor({
                $namespaces: {rbx: "rabix"}
            });

            const serialized = model.serialize();
            expect(serialized.$namespaces).to.include({rbx: "rabix"});
        });

    });
}

export function testCommandOutputBindingSerialization<T extends CommandLineToolModel | WorkflowModel>(modelConstructor: { new(...args): T }) {

    describe("outputBinding", () => {
        describe("serialization", () => {
            it("should not serialize if it would go as an empty object", () => {
                const model = new modelConstructor({
                    outputs: [{
                        id: "orec",
                        type: {
                            type: "record", fields: [{
                                name: "ofoo",
                                type: "File",
                                outputBinding: {glob: "foo"}
                            }],
                        },
                        outputBinding: {}
                    }]
                });

                const serialized = model.serialize();
                expect(serialized.outputs[0].outputBinding).to.be.undefined;
            });
        });
    })
}