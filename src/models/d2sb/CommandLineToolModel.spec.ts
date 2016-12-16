import {expect} from "chai";
import {CommandLineToolModel} from "./CommandLineToolModel";
import {CommandInputParameterModel} from "./CommandInputParameterModel";
import * as BWAMemTool from "../../tests/apps/bwa-mem-tool";
import * as BWAMemJob from "../../tests/apps/bwa-mem-job";
import * as BamtoolsIndex from "../../tests/apps/bamtools-index-sbg";
import * as BamtoolsSplit from "../../tests/apps/bamtools-split-sbg";
import * as BindingTestTool from "../../tests/apps/binding-test-tool";
import {CommandLineTool} from "../../mappings/d2sb/CommandLineTool";
import {ExpressionModel} from "./ExpressionModel";

describe("CommandLineToolModel d2sb", () => {
    describe("constructor", () => {

        it("Should instantiate tool with minimum requirements", () => {
            let tool = new CommandLineToolModel("", {
                baseCommand: 'grep',
                inputs: [],
                outputs: [],
                "class": 'CommandLineTool'
            });

            expect(tool).to.not.be.undefined;
            expect(tool.class).to.equal('CommandLineTool');
        });

        it("Should create CommandInputParameterModel from input fields", () => {
            let tool = new CommandLineToolModel("", {
                baseCommand: 'grep',
                inputs: [
                    {id: "i1", type: "string"}
                ],
                outputs: [],
                "class": 'CommandLineTool'
            });

            expect(tool.inputs).to.have.length(1);
            expect(tool.inputs[0]).to.be.instanceOf(CommandInputParameterModel);
        })
    });

    describe("getCommandLine", () => {

        it("Should evaluate baseCommand with expression", () => {
            let tool = new CommandLineToolModel("", {
                "class": "CommandLineTool",
                inputs: [],
                outputs: [],
                baseCommand: [{
                    script: "'aba'",
                    "class": "Expression",
                    engine: "cwl-js-engine"
                }]
            });

            expect(tool.getCommandLine()).to.equal('aba');
        });

        it("Should evaluate baseCommand with expression that returns a number", () => {
            let tool = new CommandLineToolModel("", {
                "class": "CommandLineTool",
                inputs: [],
                outputs: [],
                baseCommand: [{
                    script: "3 + 3",
                    "class": "Expression",
                    engine: "cwl-js-engine"
                }]
            });

            expect(tool.getCommandLine()).to.equal('6');
        });

        it("Should evaluate BWA mem tool: General test of command line generation", () => {
            //noinspection TypeScriptUnresolvedVariable
            let tool = new CommandLineToolModel("", BWAMemTool.default);
            //noinspection TypeScriptUnresolvedVariable
            tool.setJob(BWAMemJob.default);

            expect(tool.getCommandLine()).to.equal(`python bwa mem -t 4 -I 1,2,3,4 -m 3 chr20.fa example_human_Illumina.pe_1.fastq example_human_Illumina.pe_2.fastq`);
        });

        it("Should evaluate BWM mem tool: Test nested prefixes with arrays", () => {
            //noinspection TypeScriptUnresolvedVariable
            let tool = new CommandLineToolModel("", BindingTestTool.default);
            //noinspection TypeScriptUnresolvedVariable
            tool.setJob(BWAMemJob.default);

            expect(tool.getCommandLine()).to.equal(`python bwa mem chr20.fa -XXX -YYY example_human_Illumina.pe_1.fastq -YYY example_human_Illumina.pe_2.fastq`);
        });

        it("Should evaluate BamTools Index from sbg", () => {
            //noinspection TypeScriptUnresolvedVariable
            let tool = new CommandLineToolModel("", <CommandLineTool> BamtoolsIndex.default);

            expect(tool.getCommandLine()).to.equal('/opt/bamtools/bin/bamtools index -in input_bam.bam');
        });

        it("Should evaluate BamTools Split from sbg", () => {
            //noinspection TypeScriptUnresolvedVariable
            let tool = new CommandLineToolModel("", BamtoolsSplit.default);

            expect(tool.getCommandLine()).to.equal('/opt/bamtools/bin/bamtools split -in input/input_bam.ext -refPrefix refp -tagPrefix tagp -stub input_bam.splitted -mapped -paired -reference -tag tag');
        });
    });

    describe("serialize", () => {
        it("should return same object for template", () => {
            const tool: CommandLineTool = {
                'class': "CommandLineTool",
                inputs: [],
                outputs: [],
                baseCommand: []
            };

            const model = new CommandLineToolModel("", tool);

            expect(model.serialize()).to.deep.equal(tool);
        });

        it("should return same object for tool with baseCommand", () => {
            const tool: CommandLineTool = {
                "class": "CommandLineTool",
                inputs: [],
                outputs: [],
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

            const model = new CommandLineToolModel("", tool);

            expect(model.serialize()).to.deep.equal(tool);
        });

        it("should split string with whitespace in baseCommand", () => {
            const tool: CommandLineTool = {
                "class": "CommandLineTool",
                inputs: [],
                outputs: [],
                baseCommand: [
                    "string1 string2",
                    {
                        "class": "Expression",
                        engine: "cwl-js-engine",
                        script: "{ return $job.inputs.file.path; }"
                    }
                ]
            };

            const model = new CommandLineToolModel("", tool);
            expect(tool.baseCommand).to.have.length(2);
            expect((<CommandLineTool> model.serialize()).baseCommand).to.have.length(3);
            expect((<CommandLineTool> model.serialize()).baseCommand[0]).to.equal("string1");
            expect((<CommandLineTool> model.serialize()).baseCommand[1]).to.equal("string2");

        });

        it("should serialize object with custom properties", () => {
            const tool: CommandLineTool = {
                "class": "CommandLineTool",
                inputs: [],
                outputs: [],
                arguments: [],
                baseCommand: ['']
            };

            tool["customProperty"] = 35;

            const serialized = new CommandLineToolModel("", tool).serialize();

            expect(serialized).to.have.property("customProperty");
            expect(serialized["customProperty"]).to.equal(35);
        });

        it("should serialize template deterministically", () => {
            const tool: CommandLineTool = {
                inputs: [],
                outputs: [],
                'class': "CommandLineTool",
                arguments: [],
                baseCommand: []
            };

            const model = new CommandLineToolModel("", tool);

            // class and ID should be at the beginning of the object
            expect(JSON.stringify(model.serialize())).to.not.equal(JSON.stringify(tool));

            const model2 = new CommandLineToolModel("", tool);

            expect(JSON.stringify(model.serialize())).to.equal(JSON.stringify(model2.serialize()));
        });

        it("should serialize arguments", () => {
            const tool: CommandLineTool = {
                inputs: [],
                outputs: [],
                baseCommand: ["cmd"],
                "class": "CommandLineTool",
                "arguments": [
                    "hello world",
                    {
                        "prefix": "asdf",
                        "position": 3
                    },
                    {
                        "separate": true,
                        "valueFrom": {
                            "script": "{\n  reference_file = $job.inputs.reference.path.split('/')[$job.inputs.reference.path.split('/').length-1]\n  ext = reference_file.split('.')[reference_file.split('.').length-1]\n  if(ext=='tar'){\n    return ''\n  }\n  else{\n    tar_cmd = 'tar -cf ' + reference_file + '.tar ' + reference_file + ' *.amb' + ' *.ann' + ' *.bwt' + ' *.pac' + ' *.sa' \n    return ' ; ' + tar_cmd\n  }\n}",
                            "class": "Expression",
                            "engine": "#cwl-js-engine"
                        }
                    }
                ],
            };

            const model = new CommandLineToolModel("document", tool);

            expect(model.serialize()).to.deep.equal(tool);
        });

        it("should serialize inputs", () => {
            const tool: CommandLineTool = {
                outputs: [],
                baseCommand: 'cmd',
                "class": "CommandLineTool",
                inputs: [
                    {
                        "type": [
                            "null",
                            {
                                "type": "enum",
                                "name": "bwt_construction",
                                "symbols": [
                                    "bwtsw",
                                    "is",
                                    "div"
                                ]
                            }
                        ],
                        "inputBinding": {
                            "separate": true,
                            "sbg:cmdInclude": true,
                            "prefix": "-a"
                        },
                        "sbg:toolDefaultValue": "auto",
                        "description": "Algorithm for constructing BWT index. Available options are:s\tIS linear-time algorithm for constructing suffix array. It requires 5.37N memory where N is the size of the database. IS is moderately fast, but does not work with database larger than 2GB. IS is the default algorithm due to its simplicity. The current codes for IS algorithm are reimplemented by Yuta Mori. bwtsw\tAlgorithm implemented in BWT-SW. This method works with the whole human genome. Warning: `-a bwtsw' does not work for short genomes, while `-a is' and `-a div' do not work not for long genomes.",
                        "sbg:category": "Configuration",
                        "id": "#bwt_construction",
                        "label": "Bwt construction"
                    },
                    {
                        "description": "Prefix of the index [same as fasta name].",
                        "sbg:category": "Configuration",
                        "id": "#prefix_of_the_index_to_be_output",
                        "label": "Prefix of the index to be output",
                        "type": [
                            "null",
                            "string"
                        ]
                    },
                    {
                        "type": [
                            "null",
                            "int"
                        ],
                        "sbg:toolDefaultValue": "10000000",
                        "description": "Block size for the bwtsw algorithm (effective with -a bwtsw).",
                        "sbg:category": "Configuration",
                        "id": "#block_size",
                        "label": "Block size"
                    },
                    {
                        "description": "Index files named as <in.fasta>64 instead of <in.fasta>.*.",
                        "sbg:category": "Configuration",
                        "id": "#add_64_to_fasta_name",
                        "label": "Output index files renamed by adding 64",
                        "type": [
                            "null",
                            "boolean"
                        ]
                    },
                    {
                        "type": [
                            "File"
                        ],
                        "sbg:stageInput": "link",
                        "description": "Input reference fasta of TAR file with reference and indices.",
                        "sbg:category": "File input",
                        "id": "#reference",
                        "label": "Reference",
                        "sbg:fileTypes": "FASTA,FA,FA.GZ,FASTA.GZ,TAR"
                    },
                    {
                        "description": "Total memory [GB] to be reserved for the tool (Default value is 1.5 x size_of_the_reference).",
                        "sbg:category": "Configuration",
                        "id": "#total_memory",
                        "label": "Total memory [Gb]",
                        "type": [
                            "null",
                            "int"
                        ]
                    }
                ]
            };

            const model = new CommandLineToolModel("document", tool);

            expect(model.serialize()).to.deep.equal(tool);
        });

        it("should serialize outputs", () => {
            const tool: CommandLineTool = {
                inputs: [],
                baseCommand: 'cmd',
                "class": "CommandLineTool",
                outputs: [
                    {
                        "type": [
                            "null",
                            "File"
                        ],
                        "description": "TARed fasta with its BWA indices.",
                        "outputBinding": {
                            "glob": {
                                "script": "{\n  reference_file = $job.inputs.reference.path.split('/')[$job.inputs.reference.path.split('/').length-1]\n  ext = reference_file.split('.')[reference_file.split('.').length-1]\n  if(ext=='tar'){\n    return reference_file\n  }\n  else{\n    return reference_file + '.tar'\n  }\n}\n",
                                "class": "Expression",
                                "engine": "#cwl-js-engine"
                            },
                            "sbg:inheritMetadataFrom": "#reference"
                        },
                        "id": "#indexed_reference",
                        "label": "TARed fasta with its BWA indices",
                        "sbg:fileTypes": "TAR"
                    },
                    {
                        "type": [
                            "null",
                            "File"
                        ],
                        "description": "TARed fasta with its BWA indices.",
                        "outputBinding": {
                            loadContents: true,
                            secondaryFiles: [".txt", ".index"],
                            outputEval: {
                                "class": "Expression",
                                engine: "#cwl-js-engine",
                                script: "$job.inputs[1].path"
                            },
                            "glob": {
                                "script": "{\n  reference_file = $job.inputs.reference.path.split('/')[$job.inputs.reference.path.split('/').length-1]\n  ext = reference_file.split('.')[reference_file.split('.').length-1]\n  if(ext=='tar'){\n    return reference_file\n  }\n  else{\n    return reference_file + '.tar'\n  }\n}\n",
                                "class": "Expression",
                                "engine": "#cwl-js-engine"
                            },
                            "sbg:inheritMetadataFrom": "#reference"
                        },
                        "id": "#indexed_reference",
                        "label": "TARed fasta with its BWA indices",
                        "sbg:fileTypes": "TAR"
                    }
                ]
            };

            const model = new CommandLineToolModel("document", tool);

            expect(model.serialize()).to.deep.equal(tool);
        });
    });

    describe("updateValidity", () => {
        it("should be triggered when baseCommand is invalid", () => {
            const tool = new CommandLineToolModel("", {
                "class": "CommandLineTool",
                inputs: [],
                outputs: [],
                baseCommand: []
            });
            const expr = new ExpressionModel("", {
                "class": "Expression",
                script: "---",
                engine: "#cwl-js-engine"
            });


            expect(tool.validation.errors).to.be.empty;
            tool.addBaseCommand(expr);
            expect(tool.validation.errors).to.be.empty;

            expr.evaluate();

            expect(tool.validation.errors).to.not.be.empty;
            expect(tool.validation.errors[0].loc).to.equal("document.baseCommand[0]");
            expect(tool.validation.errors[0].message).to.contain("SyntaxError");

            const expr2 = new ExpressionModel("", {
                "class": "Expression",
                script: "abb",
                engine: "#cwl-js-engine"
            });

            expect(tool.validation.warnings).to.be.empty;
            tool.addBaseCommand(expr2);
            expr2.evaluate();

            expect(tool.validation.warnings).to.not.be.empty;
            expect(tool.validation.warnings[0].loc).to.equal("document.baseCommand[1]", "location of warning");
            expect(tool.validation.warnings[0].message).to.contain("ReferenceError", "value of warning");

            expect(tool.validation.errors[0].loc).to.equal("document.baseCommand[0]", "location of error after setting warning");
            expect(tool.validation.errors[0].message).to.contain("SyntaxError", "value of error after setting warning");
        });

    });
});