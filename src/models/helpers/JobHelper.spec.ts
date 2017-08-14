import {expect} from "chai";
import {SBDraft2CommandInputParameterModel} from "../d2sb/SBDraft2CommandInputParameterModel";
import {JobHelper} from "./JobHelper";
import {WorkflowFactory} from "../generic/WorkflowFactory";

describe("JobHelper", () => {
    it("should return mock values for an array or records", () => {
        const input = new SBDraft2CommandInputParameterModel({
            id: "1",
            type: {
                type: "array",
                items: {
                    type: "record",
                    fields: [
                        {
                            id: "f1",
                            type: "string"
                        },
                        {
                            id: "f2",
                            type: "File"
                        }
                    ]
                }
            }
        });

        const jobPart = JobHelper.generateMockJobData(input);

        expect(jobPart).to.deep.equal([
            {
                f1: "f1-string-value",
                f2: {
                    path: "/path/to/f2.ext",
                    "class": "File",
                    contents: "file contents",
                    secondaryFiles: [],
                    size: 0
                }
            },
            {
                f1: "f1-string-value",
                f2: {
                    path: "/path/to/f2.ext",
                    "class": "File",
                    contents: "file contents",
                    secondaryFiles: [],
                    size: 0
                }
            }
        ])
    });

    it("should return mock values for a workflow", () => {
        const job = {
            input1: "input1-string-value",
            input2: {
                class: "File",
                basename: "input2.ext",
                contents: "file contents",
                nameext: ".ext",
                nameroot: "input2",
                secondaryFiles: [],
                size: 0,
                path: "/path/to/input2.ext"
            }
        };

        const workflow = WorkflowFactory.from({
            cwlVersion: "v1.0",
            class: "Workflow",
            inputs: {
                input1: "string",
                input2: "File"
            },
            outputs: [],
            steps: []
        } as any);

        expect(JobHelper.getJobInputs(workflow)).to.deep.equal(job);
    })
});