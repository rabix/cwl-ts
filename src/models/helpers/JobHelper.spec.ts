import {expect} from "chai";
import {SBDraft2CommandInputParameterModel} from "../d2sb/SBDraft2CommandInputParameterModel";
import {JobHelper} from "./JobHelper";

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
                    secondaryFiles: [],
                    size: 0
                }
            },
            {
                f1: "f1-string-value",
                f2: {
                    path: "/path/to/f2.ext",
                    "class": "File",
                    secondaryFiles: [],
                    size: 0
                }
            }
        ])
    });
});