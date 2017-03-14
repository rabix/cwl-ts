import {expect} from "chai";
import {V1StepModel} from "./V1StepModel";
import {WorkflowStep} from "../../mappings/v1.0/WorkflowStep";
import {CommandLineTool} from "../../mappings/v1.0/CommandLineTool";

describe("V1StepModel", () => {
    describe("serialize", () => {
        let step: V1StepModel;
        let serialize: WorkflowStep;
        beforeEach(() => {
            step = new V1StepModel({
                id: "step_id",
                in: {
                    one: "source1",
                    two: "source2"
                },
                out: [{id: "four"}],
                run: {
                    cwlVersion: "v1.0",
                    "class": "CommandLineTool",
                    id: "tool",
                    baseCommand: ["echo"],
                    inputs: {
                        one: "File",
                        two: "string?"
                    },
                    outputs: {
                        four: "string"
                    },
                    doc: "tool doc",
                    label: "tool label"
                },
                hints: [1, 2, 3],
                requirements: [{
                    "class": "ResourceRequirement",
                    coresMin: 3
                }]
            });

            serialize = step.serialize();
        });

        it("should return step in", () => {
           expect(serialize.in).to.have.length(2);
           expect(serialize.in[0].id).to.equal("one");
           expect(serialize.in[0].source).to.contain("source1");
           expect(serialize.in[1].id).to.equal("two");
           expect(serialize.in[1].source).to.contain("source2");
        });

        it("should return step out", () => {
            expect(serialize.out).to.have.length(1);
            expect(serialize.out[0]).to.haveOwnProperty("id");
            expect(serialize.out[0]["id"]).to.equal("four");
        });

        it("should return run", () => {
            const run: CommandLineTool = <CommandLineTool> serialize.run;

            expect(run.class).to.equal("CommandLineTool");
            expect(run.cwlVersion).to.equal("v1.0");
        });

        it("should return hints", () => {
            expect(serialize.hints).to.deep.equal([1, 2, 3]);
        });

        it("should return requirements", () => {
            expect(serialize.requirements).to.deep.equal([{
                "class": "ResourceRequirement",
                coresMin: 3
            }]);
        })
    });
});