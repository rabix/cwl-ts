import {expect} from "chai/index";
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
            let tool = new CommandLineToolModel(BamtoolsIndex.default);

            expect(tool.getCommandLine()).to.equal('/opt/bamtools/bin/bamtools index -in input_bam.bam');
        });

        it("Should evaluate BamTools Split from sbg", () => {
            let tool = new CommandLineToolModel(BamtoolsSplit.default);

            expect(tool.getCommandLine()).to.equal('/opt/bamtools/bin/bamtools split -in input/input_bam.ext -refPrefix refp -tagPrefix tagp -stub input_bam.splitted -mapped -paired -reference -tag tag');
        });
    });
});