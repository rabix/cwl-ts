import {expect, should} from "chai";
import {testNamespaces} from "../../tests/shared/model";
import {SBDraft2CommandLineToolModel} from "./SBDraft2CommandLineToolModel";
import {SBDraft2CommandInputParameterModel} from "./SBDraft2CommandInputParameterModel";
import * as BWAMemTool from "../../tests/apps/bwa-mem-tool";
import * as BWAMemJob from "../../tests/apps/bwa-mem-job";
import * as BamtoolsIndex from "../../tests/apps/bamtools-index-sbg";
import * as BamtoolsSplit from "../../tests/apps/bamtools-split-sbg";
import * as BfctoolsAnnotate from "../../tests/apps/bfctools-annotate-sbg";
import * as BindingTestTool from "../../tests/apps/binding-test-tool";
import {CommandLineTool} from "../../mappings/d2sb/CommandLineTool";
import {ExpressionEvaluator} from "../helpers/ExpressionEvaluator";
import {JSExecutor} from "../helpers/JSExecutor";

should();

describe("SBDraft2CommandLineToolModel", () => {
    beforeEach(() => {
        ExpressionEvaluator.evaluateExpression = JSExecutor.evaluate;
    });

    testNamespaces(SBDraft2CommandLineToolModel);

    describe("constructor", () => {

        it("Should instantiate tool with minimum requirements", () => {
            let tool = new SBDraft2CommandLineToolModel({
                baseCommand: 'grep',
                inputs: [],
                outputs: [],
                "class": 'CommandLineTool'
            });

            expect(tool).to.not.be.undefined;
            expect(tool.class).to.equal('CommandLineTool');
        });

        it("Should create SBDraft2CommandInputParameterModel from input fields", () => {
            let tool = new SBDraft2CommandLineToolModel({
                baseCommand: 'grep',
                inputs: [
                    {id: "i1", type: "string"}
                ],
                outputs: [],
                "class": 'CommandLineTool'
            });

            expect(tool.inputs).to.have.length(1);
            expect(tool.inputs[0]).to.be.instanceOf(SBDraft2CommandInputParameterModel);
        });

    });

    describe("generateCommandLine Async", () => {
        it.skip("should evaluate command line with array of record, in which field is a file", (done) => {
            const tool = new SBDraft2CommandLineToolModel({
                'class': "CommandLineTool",
                outputs: [],
                baseCommand: [],
                inputs: [
                    {
                        "type": [
                            "null",
                            {
                                type: "array",
                                items: {
                                    "type": "record",
                                    "fields": [
                                        {
                                            "type": [
                                                "null",
                                                "File"
                                            ],
                                            "inputBinding": {
                                                "prefix": "--s",
                                                "separate": true
                                            },
                                            "name": "file_input"
                                        }
                                    ],
                                    "name": "record"
                                }
                            }
                        ],
                        "inputBinding": {
                            "prefix": "--rec",
                            "separate": true
                        },
                        "id": "#record"
                    }
                ]
            });

            tool.generateCommandLine().then(function (cmd) {
                expect(cmd).to.equal('--rec --s /path/to/file_input.ext --s /path/to/file_input.ext');
            }).then(done, done);
        });


        it("Should evaluate some command line from inputs async", function (done) {
            const tool = new SBDraft2CommandLineToolModel({
                'class': "CommandLineTool",
                outputs: [],
                baseCommand: [],
                inputs: [
                    {
                        "type": [
                            "null",
                            "string"
                        ],
                        "inputBinding": {},
                        "id": "#inp1"
                    },
                    {
                        "type": [
                            "null",
                            {
                                "type": "record",
                                "fields": [
                                    {
                                        "type": [
                                            "null",
                                            "string"
                                        ],
                                        "inputBinding": {
                                            "prefix": "--s",
                                            "separate": true
                                        },
                                        "name": "string_input"
                                    },
                                    {
                                        "type": [
                                            "null",
                                            "boolean"
                                        ],
                                        "inputBinding": {
                                            "separate": true,
                                            "prefix": "--bool",
                                            "valueFrom": {
                                                "class": "Expression",
                                                "engine": "#cwl-js-engine",
                                                "script": "3 + 444"
                                            }
                                        },
                                        "name": "valueFrom"
                                    }
                                ],
                                "name": "record"
                            }
                        ],
                        "inputBinding": {
                            "prefix": "--rec",
                            "separate": true
                        },
                        "id": "#record"
                    },
                    {
                        "type": [
                            "null",
                            {
                                "type": "enum",
                                "symbols": [
                                    "asdf",
                                    "asdf",
                                    "fdsa"
                                ],
                                "name": "enum"
                            }
                        ],
                        "inputBinding": {},
                        "id": "#enum"
                    }
                ]
            });

            tool.generateCommandLine().then(function (cmd) {
                expect(cmd).to.equal('asdf inp1-string-value --rec --s string_input-string-value --bool 447');
            }).then(done, done);
        });
    });

    describe("generateCommandLine", () => {

        it("should evaluate an incorrectly formed job", (done) => {
            const model = new SBDraft2CommandLineToolModel({
                class: "CommandLineTool",
                cwlVersion: "sbg:draft-2",
                inputs: [
                    {
                        id: "#reference",
                        type: "File",
                        inputBinding: {}
                    }
                ],
                outputs: [],
                baseCommand: "",
            });
            model.setJobInputs({
                "reference": {
                    "path": "."
                }
            });

            model.generateCommandLine().then(cmd => {
                expect(cmd).to.equal(".");
            }).then(done, done);

        });

        it("Should evaluate baseCommand with expression", (done) => {
            let tool = new SBDraft2CommandLineToolModel({
                "class": "CommandLineTool",
                inputs: [],
                outputs: [],
                baseCommand: [{
                    script: "'aba'",
                    "class": "Expression",
                    engine: "cwl-js-engine"
                }]
            });

            tool.generateCommandLine().then(cmd => {
                expect(cmd).to.equal('aba');
            }).then(done, done);
        });

        it("Should evaluate baseCommand with expression that returns a number", (done) => {
            let tool = new SBDraft2CommandLineToolModel({
                "class": "CommandLineTool",
                inputs: [],
                outputs: [],
                baseCommand: [{
                    script: "3 + 3",
                    "class": "Expression",
                    engine: "cwl-js-engine"
                }]
            });

            tool.generateCommandLine().then(cmd => {
                expect(cmd).to.equal('6');
            }).then(done, done);
        });

        it("Should evaluate BWA mem tool: General test of command line generation", (done) => {
            let tool = new SBDraft2CommandLineToolModel(BWAMemTool.default);
            tool.setJobInputs(BWAMemJob.default);
            tool.setRuntime(BWAMemJob.default.allocatedResources);

            tool.generateCommandLine().then(cmd => {
                expect(cmd).to.equal(`python bwa mem -t 4 -I 1,2,3,4 -m 3 chr20.fa example_human_Illumina.pe_1.fastq example_human_Illumina.pe_2.fastq > output.sam`);
            }).then(done, done);
        });


        it.skip("Should evaluate Bfctools Annotate from sbg", (done) => {
            let tool = new SBDraft2CommandLineToolModel(BfctoolsAnnotate.default);

            tool.generateCommandLine().then(cmd => {
                expect(cmd).to.equal(`bcftools annotate -o annotated_input_file.ext.vcf.gz -a /path/to/annotations.ext -i 'REF=C' -Ob /path/to/input_file.ext.vcf.gz`);
            }).then(done, done);
        });

        it("Should evaluate BWM mem tool: Test nested prefixes with arrays", (done) => {
            let tool = new SBDraft2CommandLineToolModel(BindingTestTool.default);
            tool.setJobInputs(BWAMemJob.default);
            tool.setRuntime(BWAMemJob.default.allocatedResources);

            tool.generateCommandLine().then(cmd => {
                expect(cmd).to.equal(`python bwa mem chr20.fa -XXX -YYY example_human_Illumina.pe_1.fastq -YYY example_human_Illumina.pe_2.fastq`);
            }).then(done, done);
        });

        it("Should evaluate BamTools Index from sbg", (done) => {
            let tool = new SBDraft2CommandLineToolModel(<CommandLineTool> BamtoolsIndex.default);

            tool.generateCommandLine().then(cmd => {
                expect(cmd).to.equal('/opt/bamtools/bin/bamtools index -in input_bam.bam');
            }).then(done, done);
        });

        it("Should evaluate BamTools Split from sbg", (done) => {
            let tool = new SBDraft2CommandLineToolModel(BamtoolsSplit.default);

            tool.generateCommandLine().then(cmd => {
                expect(cmd).to.equal('/opt/bamtools/bin/bamtools split -in input/input_bam.ext -refPrefix refp -tagPrefix tagp -stub input_bam.splitted -mapped -paired -reference -tag tag');
            }).then(done, done);
        });
    });

    describe("serialize", () => {
        it("should return same object for template", () => {
            const tool: CommandLineTool = {
                $namespaces: {sbg: "https://www.sevenbridges.com/"},
                class: "CommandLineTool",
                cwlVersion: "sbg:draft-2",
                inputs: [],
                outputs: [],
                baseCommand: []
            };

            const model = new SBDraft2CommandLineToolModel(tool);

            const target = model.serialize();
            delete target["sbg:job"];
            expect(target).to.deep.equal(tool);
        });

        it("should return same object for tool with baseCommand", () => {
            const tool: CommandLineTool = {
                $namespaces: {sbg: "https://www.sevenbridges.com/"},
                "class": "CommandLineTool",
                cwlVersion: "sbg:draft-2",
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
                ],
                "requirements": [
                    {
                        "class": "ExpressionEngineRequirement",
                        "id": "#cwl-js-engine",
                        "requirements": [
                            {
                                "class": "DockerRequirement",
                                "dockerPull": "rabix/js-engine"
                            }
                        ]
                    }
                ]
            };

            const model      = new SBDraft2CommandLineToolModel(tool);
            const serialized = model.serialize();
            delete serialized["sbg:job"];
            expect(serialized).to.deep.equal(tool);
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

            const model = new SBDraft2CommandLineToolModel(tool);
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

            const serialized = new SBDraft2CommandLineToolModel(tool).serialize();

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

            const model = new SBDraft2CommandLineToolModel(tool);

            // class and ID should be at the beginning of the object
            expect(JSON.stringify(model.serialize())).to.not.equal(JSON.stringify(tool));

            const model2 = new SBDraft2CommandLineToolModel(tool);

            expect(JSON.stringify(model.serialize())).to.equal(JSON.stringify(model2.serialize()));
        });

        it("should serialize arguments", () => {
            const tool: CommandLineTool = {
                $namespaces: {sbg: "https://www.sevenbridges.com/"},
                inputs: [],
                outputs: [],
                cwlVersion: "sbg:draft-2",
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
                        position: 0,
                        "valueFrom": {
                            "script": "{\n  reference_file = $job.inputs.reference.path.split('/')[$job.inputs.reference.path.split('/').length-1]\n  ext = reference_file.split('.')[reference_file.split('.').length-1]\n  if(ext=='tar'){\n    return ''\n  }\n  else{\n    tar_cmd = 'tar -cf ' + reference_file + '.tar ' + reference_file + ' *.amb' + ' *.ann' + ' *.bwt' + ' *.pac' + ' *.sa' \n    return ' ; ' + tar_cmd\n  }\n}",
                            "class": "Expression",
                            "engine": "#cwl-js-engine"
                        }
                    }
                ],
                requirements: [{
                    id: "#cwl-js-engine",
                    "class": "ExpressionEngineRequirement",
                    requirements: [
                        {
                            dockerPull: "rabix/js-engine",
                            "class": "DockerRequirement"
                        }
                    ]
                }]
            };

            const model = new SBDraft2CommandLineToolModel(tool);

            const target = model.serialize();
            delete target["sbg:job"];
            expect(target).to.deep.equal(tool);
        });

        it("should serialize inputs", () => {
            const tool: CommandLineTool = {
                $namespaces: {sbg: "https://www.sevenbridges.com/"},
                outputs: [],
                baseCommand: 'cmd',
                cwlVersion: "sbg:draft-2",
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
                            position: 0,
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
                        "sbg:fileTypes": "FASTA, FA, FA.GZ, FASTA.GZ, TAR"
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
                ],
                "sbg:job": {
                    "allocatedResources": {
                        "cpu": 1,
                        "mem": 1000
                    },
                    "inputs": {
                        "add_64_to_fasta_name": true,
                        "block_size": 5,
                        "bwt_construction": "bwtsw",
                        "prefix_of_the_index_to_be_output": "prefix_of_the_index_to_be_output-string-value",
                        "reference": {
                            "class": "File",
                            "path": "/path/to/reference.ext",
                            "secondaryFiles": [],
                            "size": 0,
                        },
                        "total_memory": 8,
                    }
                }

            };

            const model = new SBDraft2CommandLineToolModel(tool);

            expect(model.serialize()).to.deep.equal(tool);
        });

        it("should serialize outputs", () => {
            const tool: CommandLineTool = {
                $namespaces: {sbg: "https://www.sevenbridges.com/"},
                inputs: [],
                cwlVersion: "sbg:draft-2",
                baseCommand: 'cmd',
                "class": "CommandLineTool",
                "requirements": [
                    {
                        "class": "ExpressionEngineRequirement",
                        "id": "#cwl-js-engine",
                        "requirements": [
                            {
                                "class": "DockerRequirement",
                                "dockerPull": "rabix/js-engine"
                            }
                        ]
                    }
                ],
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
                        "id": "#indexed_reference_1",
                        "label": "TARed fasta with its BWA indices",
                        "sbg:fileTypes": "TAR"
                    }
                ]
            };

            const model = new SBDraft2CommandLineToolModel(tool);

            const serialize = model.serialize();
            delete serialize["sbg:job"];
            expect(serialize).to.deep.equal(tool);
        });

        it("should serialize createFileRequirement", () => {
            const tool = {
                $namespaces: {sbg: "https://www.sevenbridges.com/"},
                "baseCommand": [],
                cwlVersion: "sbg:draft-2",
                "inputs": [],
                "outputs": [],
                "class": "CommandLineTool",
                "requirements": [
                    {
                        "class": "ExpressionEngineRequirement",
                        "id": "#cwl-js-engine",
                        "requirements": [
                            {
                                "class": "DockerRequirement",
                                "dockerPull": "rabix/js-engine"
                            }
                        ]
                    },
                    {
                        "fileDef": [
                            {
                                "fileContent": {
                                    "engine": "#cwl-js-engine",
                                    "class": "Expression",
                                    "script": "script value"
                                },
                                "filename": {
                                    "engine": "#cwl-js-engine",
                                    "class": "Expression",
                                    "script": "script value"
                                }
                            }
                        ],
                        "class": "CreateFileRequirement"
                    }
                ]
            };

            const model = new SBDraft2CommandLineToolModel(<CommandLineTool>tool);

            const target = model.serialize();
            delete target["sbg:job"];
            expect(target).to.deep.equal(tool);
        });

        it("should serialize hints", () => {
            const tool = {
                $namespaces: {sbg: "https://www.sevenbridges.com/"},
                "baseCommand": [],
                cwlVersion: "sbg:draft-2",
                "inputs": [],
                "outputs": [],
                "class": "CommandLineTool",
                "hints": [
                    "value",
                    {
                        arbitrary: "object"
                    },
                    {
                        "value": 1,
                        "class": "sbg:CPURequirement"
                    },
                    {
                        "value": 1000,
                        "class": "sbg:MemRequirement"
                    },
                    {
                        "dockerPull": "images",
                        "dockerImageId": "asdf",
                        "class": "DockerRequirement"
                    }
                ]
            };

            const model = new SBDraft2CommandLineToolModel(<CommandLineTool>tool);

            const target = model.serialize();
            delete target["sbg:job"];
            expect(target).to.deep.equal(tool);
        });

        it("should serialize success/permanentFail/temporaryFail codes", () => {
            const tool = {
                $namespaces: {sbg: "https://www.sevenbridges.com/"},
                "baseCommand": [],
                cwlVersion: "sbg:draft-2",
                "inputs": [],
                "outputs": [],
                "class": "CommandLineTool",
                "successCodes": [123, 456, 789],
                "permanentFailCodes": [11],
                "temporaryFailCodes": [34, 23, 221]
            };

            const model = new SBDraft2CommandLineToolModel(<CommandLineTool>tool);

            const target = model.serialize();
            delete target["sbg:job"];
            expect(target).to.deep.equal(tool);
        });
    });

    describe("updateValidity", () => {
        it("should be triggered when baseCommand is invalid", (done) => {
            const tool = new SBDraft2CommandLineToolModel({
                "class": "CommandLineTool",
                inputs: [],
                outputs: [],
                baseCommand: []
            });

            expect(tool.errors).to.be.empty;
            tool.addBaseCommand({
                "class": "Expression",
                script: "---",
                engine: "#cwl-js-engine"
            });
            expect(tool.errors).to.be.empty;

            expect(tool.warnings).to.be.empty;
            tool.addBaseCommand({
                "class": "Expression",
                script: "abb",
                engine: "#cwl-js-engine"
            });

            tool.validate().then(() => {
                expect(tool.warnings).to.not.deep.equal([], "should have warning");
                expect(tool.warnings[0].loc).to.equal("document.baseCommand[1]", "location of warning");
            }).then(done, done);
        });
    });

    describe("jobManagement", () => {
        it("should copy sbg:job if available", () => {
            const model = new SBDraft2CommandLineToolModel(<any> {
                "sbg:job": {
                    inputs: {
                        first: "a specific string"
                    }
                }
            });

            expect(model.getContext().$job.inputs).to.haveOwnProperty("first");
            expect(model.getContext().$job.inputs.first).to.equal("a specific string");
        });

        it("should populate undefined job values with null if sbg:job is defined", () => {
            const model = new SBDraft2CommandLineToolModel(<any> {
                inputs: [
                    {
                        id: "#first",
                        type: "string"
                    },
                    {
                        id: "#second",
                        type: "int"
                    }
                ],
                "sbg:job": {
                    inputs: {
                        first: "a specific string"
                    }
                }
            });

            expect(model.getContext().$job.inputs).to.haveOwnProperty("first");
            expect(model.getContext().$job.inputs.first).to.equal("a specific string");

            expect(model.getContext().$job.inputs).to.haveOwnProperty("second");
            expect(model.getContext().$job.inputs.second).to.be.null;

        });

        it("should add mock input to job when adding input", () => {
            const model = new SBDraft2CommandLineToolModel(<any> {});

            expect(model.getContext().$job.inputs).to.be.empty;

            model.addInput({
                id: "input",
                type: "string"
            });

            const context = model.getContext();
            expect(context.$job.inputs).to.not.be.empty;
            expect(typeof context.$job.inputs.input).to.equal("string");
        });

        it("should remove job value when removing input", () => {
            const model = new SBDraft2CommandLineToolModel(<any> {
                inputs: [{
                    id: "input",
                    type: "string"
                }]
            });

            expect(model.getContext().$job.inputs).to.have.all.keys("input");

            model.removeInput(model.inputs[0]);
            expect(model.getContext().$job.inputs).to.deep.equal({});
        });

        it("should change job value when changing input items type", () => {
            const model = new SBDraft2CommandLineToolModel(<any> {
                inputs: [{
                    id: "input",
                    type: {
                        type: "array",
                        items: "File"
                    }
                }]
            });

            const context = model.getContext().$job;

            expect(typeof context.inputs.input[0]).to.equal("object");

            model.inputs[0].type.items = "int";

            expect(typeof context.inputs.input[0]).to.equal("number");
        });

        it("should change job value when changing input type", () => {
            const model = new SBDraft2CommandLineToolModel(<any> {
                inputs: [{
                    id: "input",
                    type: "string"
                }]
            });

            const context = model.getContext();

            expect(typeof context.$job.inputs.input).to.equal("string");

            model.inputs[0].type.type = "int";

            expect(typeof context.$job.inputs.input).to.equal("number");
        });

        it("should change job key when changing input id", () => {
            const model = new SBDraft2CommandLineToolModel(<any> {
                inputs: [{
                    id: "input",
                    type: "string"
                }]
            });

            const context = model.getContext();
            expect(context.$job.inputs).to.have.all.keys("input");
            expect(typeof context.$job.inputs.input).to.equal("string");

            expect(context.$job.inputs.newId).to.be.undefined;
            expect(context.$job.inputs.input).to.not.be.undefined;

            model.changeIOId(model.inputs[0], "newId");

            expect(context.$job.inputs.input).to.be.undefined;
            expect(context.$job.inputs.newId).to.not.be.undefined;

        });

        it("should not break if input type record[] is null when retrieving field value", () => {
            const model = new SBDraft2CommandLineToolModel(<any> {
                inputs: [{
                    id: "input",
                    type: {
                        type: "array",
                        items: {
                            type: "record",
                            fields: [
                                {
                                    name: "field1",
                                    type: "string"
                                }
                            ]
                        }
                    }
                }]
            });

            model.setJobInputs({input: null});
            const context = model.getContext(model.inputs[0].type.fields[0]);

            expect(context).to.deep.equal({
                $job: {
                    allocatedResources: {
                        cpu: 1,
                        mem: 1000
                    },
                    inputs: {
                        input: null
                    }
                },
                $self: null
            });
        });
    });

    describe("ExpressionEngineRequirement", () => {
        it("should add requirement if input.inputBinding.valueFrom is expression", () => {
            const tool = new SBDraft2CommandLineToolModel(<any> {
                inputs: [
                    {
                        id: "one",
                        inputBinding: {
                            valueFrom: {
                                "class": "Expression",
                                script: "3 + 3",
                                engine: "#cwl-engine"
                            }
                        }
                    }
                ]
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("ExpressionEngineRequirement");
        });

        it("should add requirement if baseCommand is expression", () => {
            const tool = new SBDraft2CommandLineToolModel(<any> {
                baseCommand: [
                    {
                        "class": "Expression",
                        script: "3 + 3",
                        engine: "#cwl-engine"
                    }
                ]
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("ExpressionEngineRequirement");
        });


        it("should add requirement if input.secondaryFile is expression", () => {
            const tool = new SBDraft2CommandLineToolModel(<any> {
                inputs: [
                    {
                        id: "one",
                        type: "File",
                        inputBinding: {
                            secondaryFiles: [{
                                "class": "Expression",
                                script: "3 + 3",
                                engine: "#cwl-engine"
                            }]
                        }
                    }
                ]
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("ExpressionEngineRequirement");
        });

        it("should add requirement if output.outputBinding.glob is expression", () => {
            const tool = new SBDraft2CommandLineToolModel(<any> {
                outputs: [
                    {
                        id: "one",
                        outputBinding: {
                            glob: {
                                "class": "Expression",
                                script: "3 + 3",
                                engine: "#cwl-engine"
                            }
                        }
                    }
                ]
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("ExpressionEngineRequirement");
        });

        it("should add requirement if output.outputBinding.outputEval is expression", () => {
            const tool = new SBDraft2CommandLineToolModel(<any> {
                outputs: [
                    {
                        id: "one",
                        outputBinding: {
                            outputEval: {
                                "class": "Expression",
                                script: "3 + 3",
                                engine: "#cwl-engine"
                            }
                        }
                    }
                ]
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("ExpressionEngineRequirement");
        });

        it("should add requirement if output.outputBinding['sbg:metadata'] is expression", () => {
            const tool = new SBDraft2CommandLineToolModel(<any> {
                outputs: [
                    {
                        "outputBinding": {
                            "sbg:metadata": {
                                "meta": {
                                    "class": "Expression",
                                    "engine": "#cwl-js-engine",
                                    "script": "data"
                                }
                            }
                        },
                        "id": "#output",
                        "type": "File"
                    }
                ]
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("ExpressionEngineRequirement");
        });

        it("should add requirement if output.secondaryFile is expression", () => {
            const tool = new SBDraft2CommandLineToolModel(<any> {
                outputs: {
                    one: {
                        type: "File",
                        outputBinding: {
                            secondaryFiles: [{
                                "class": "Expression",
                                script: "3 + 3",
                                engine: "#cwl-engine"
                            }]
                        }
                    }
                }
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("ExpressionEngineRequirement");
        });

        it("should add requirement if stdin is expression", () => {
            const tool = new SBDraft2CommandLineToolModel(<any> {
                stdin: {"class": "Expression", script: "3 + 3", engine: "#cwl-engine"}
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("ExpressionEngineRequirement");
        });

        it("should add requirement if stdout is expression", () => {
            const tool = new SBDraft2CommandLineToolModel(<any> {
                stdout: {"class": "Expression", script: "3 + 3", engine: "#cwl-engine"}
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("ExpressionEngineRequirement");
        });

        it("should add requirement if fileRequirement has expression", () => {
            const tool = new SBDraft2CommandLineToolModel(<any> {
                requirements: [
                    {
                        "class": "CreateFileRequirement",
                        fileDef: [
                            {
                                filename: {
                                    class: "Expression",
                                    script: "3+3",
                                    engine: "#cwl-js-engine"
                                },
                                fileContent: ""
                            }
                        ]
                    }
                ]
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(2);
            expect(serialize.requirements[1].class).to.equal("ExpressionEngineRequirement");
        });

        it("should add requirement if resourceRequirement has expression", () => {
            const tool = new SBDraft2CommandLineToolModel(<any> {
                requirements: [
                    {
                        "class": "sbg:MemRequirement",
                        value: {"class": "Expression", script: "3 + 3", engine: "#cwl-engine"}
                    },
                    {
                        "class": "sbg:CPURequirement",
                        value: {"class": "Expression", script: "3 + 3", engine: "#cwl-engine"}
                    }
                ]
            });

            const serialize = tool.serialize();
            expect(serialize.hints).to.have.length(2);
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("ExpressionEngineRequirement");
        });

        it("should not remove existing requirement", () => {
            const tool = new SBDraft2CommandLineToolModel(<any> {
                requirements: [{
                    id: "#cwl-js-engine",
                    "class": "ExpressionEngineRequirement",
                    requirements: [
                        {
                            dockerPull: "rabix/js-engine",
                            "class": "DockerRequirement"
                        }
                    ]
                }]
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("ExpressionEngineRequirement");
        });

        it("should not duplicate requirement", () => {
            const tool = new SBDraft2CommandLineToolModel(<any> {
                stdin: {"class": "Expression", script: "3 + 3", engine: "#cwl-engine"},
                requirements: [{
                    id: "#cwl-js-engine",
                    "class": "ExpressionEngineRequirement",
                    requirements: [
                        {
                            dockerPull: "rabix/js-engine",
                            "class": "DockerRequirement"
                        }
                    ]
                }]
            });

            const serialize = tool.serialize();
            expect(serialize.requirements).to.not.be.empty;
            expect(serialize.requirements).to.have.length(1);
            expect(serialize.requirements[0].class).to.equal("ExpressionEngineRequirement");
        });
    })
});
