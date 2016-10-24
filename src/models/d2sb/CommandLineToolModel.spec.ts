import {expect} from "chai";
import {CommandLineToolModel} from "../d2sb/CommandLineToolModel";
import {CommandInputParameterModel} from "../d2sb/CommandInputParameterModel";

import * as BWAMemTool from "../../tests/apps/bwa-mem-tool";
import * as BWAMemJob from "../../tests/apps/bwa-mem-job";

import * as BamtoolsIndex from "../../tests/apps/bamtools-index-sbg";
import * as BamtoolsSplit from "../../tests/apps/bamtools-split-sbg";
import * as BindingTestTool from "../../tests/apps/binding-test-tool";

import {CommandLineTool} from "../../mappings/d2sb/CommandLineTool";

describe("CommandLineToolModel d2sb", () => {
    describe("constructor", () => {

        it("Should instantiate tool with minimum requirements", () => {
            let tool = new CommandLineToolModel({
                baseCommand: 'grep',
                inputs: [],
                outputs: [],
                class: 'CommandLineTool'
            });

            expect(tool).to.not.be.undefined;
            expect(tool.class).to.equal('CommandLineTool');
        });

        it("Should create CommandInputParameterModel from input fields", () => {
            let tool = new CommandLineToolModel({
                baseCommand: 'grep',
                inputs: [
                    {id: "i1", type: "string"}
                ],
                outputs: [],
                class: 'CommandLineTool'
            });

            expect(tool.inputs).to.have.length(1);
            expect(tool.inputs[0]).to.be.instanceOf(CommandInputParameterModel);
        })
    });

    describe("getCommandLine", () => {

        it("Should evaluate baseCommand with expression", () => {
            let tool = new CommandLineToolModel({
                class: "CommandLineTool",
                inputs: [],
                outputs: [],
                baseCommand: [{
                    script: "'aba'",
                    class: "Expression",
                    engine: "cwl-js-engine"
                }]
            });

            expect(tool.getCommandLine()).to.equal('aba');
        });


        it("Should evaluate baseCommand with expression that returns a number", () => {
            let tool = new CommandLineToolModel({
                class: "CommandLineTool",
                inputs: [],
                outputs: [],
                baseCommand: [{
                    script: "3 + 3",
                    class: "Expression",
                    engine: "cwl-js-engine"
                }]
            });

            expect(tool.getCommandLine()).to.equal('6');
        });

        it("Should evaluate BWA mem tool: General test of command line generation", () => {
            let tool = new CommandLineToolModel(BWAMemTool.default);
            tool.setJob(BWAMemJob.default);

            expect(tool.getCommandLine()).to.equal(`python bwa mem -t 4 -I 1,2,3,4 -m 3 chr20.fa example_human_Illumina.pe_1.fastq example_human_Illumina.pe_2.fastq`);
        });

        it("Should evaluate BWM mem tool: Test nested prefixes with arrays", () => {
            let tool = new CommandLineToolModel(BindingTestTool.default);
            tool.setJob(BWAMemJob.default);

            expect(tool.getCommandLine()).to.equal(`python bwa mem chr20.fa -XXX -YYY example_human_Illumina.pe_1.fastq -YYY example_human_Illumina.pe_2.fastq`);
        });

        it("Should evaluate BamTools Index from sbg", () => {
            let tool = new CommandLineToolModel(<CommandLineTool> BamtoolsIndex.default);

            expect(tool.getCommandLine()).to.equal('/opt/bamtools/bin/bamtools index -in input_bam.bam');
        });

        it("Should evaluate BamTools Split from sbg", () => {
            let tool = new CommandLineToolModel(BamtoolsSplit.default);

            expect(tool.getCommandLine()).to.equal('/opt/bamtools/bin/bamtools split -in input/input_bam.ext -refPrefix refp -tagPrefix tagp -stub input_bam.splitted -mapped -paired -reference -tag tag');
        });
    });

    describe("serialize", () => {
        it("should return same object for template", () => {
            const tool: CommandLineTool = {
                'class': "CommandLineTool",
                inputs: [],
                outputs: [],
                arguments: [],
                baseCommand: []
            };

            const model = new CommandLineToolModel(tool);

            expect(model.serialize()).to.deep.equal(tool);
        });

        it("should return same object for tool with baseCommand", () => {
            const tool: CommandLineTool = {
                "class": "CommandLineTool",
                inputs: [],
                outputs: [],
                arguments: [],
                baseCommand: [
                    "string1",
                    "string2",
                    {
                        "class": "Expression",
                        engine: "cwl-js-engine",
                        script: "{ return $job.inputs.file.path; }"
                    }
                ]
            };

            const model = new CommandLineToolModel(tool);

            expect(model.serialize()).to.deep.equal(tool);
        });

        it("should serialize object with custom properties", () => {
            const tool: CommandLineTool = {
                "class": "CommandLineTool",
                inputs: [],
                outputs: [],
                arguments: [],
                baseCommand: [''],
                customProperty: 35
            };

            const serialized = new CommandLineToolModel(tool).serialize();

            expect(serialized).to.have.property("customProperty");
            expect(serialized["customProperty"]).to.equal(35);
            console.log(serialized["customProperty"]);
        });

        it("should serialize template deterministically", () => {
            const tool: CommandLineTool = {
                inputs: [],
                outputs: [],
                'class': "CommandLineTool",
                arguments: [],
                baseCommand: []
            };

            const model = new CommandLineToolModel(tool);

            // class and ID should be at the beginning of the object
            expect(JSON.stringify(model.serialize())).to.not.equal(JSON.stringify(tool));

            const model2 = new CommandLineToolModel(tool);

            expect(JSON.stringify(model.serialize())).to.equal(JSON.stringify(model2.serialize()));
        })
    })
});