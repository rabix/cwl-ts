export default JSON.parse(`{
	"class": "Workflow",
	"steps": [{
		"id": "#io_tool",
		"run": {
			"label": "io-tool",
			"sbg:id": "maya/test/io-tool/1",
			"stdin": {
				"script": "$job.inputs.inFile.path",
				"class": "Expression",
				"engine": "#cwl-js-engine"
			},
			"cwlVersion": "sbg:draft-2",
			"successCodes": [],
			"hints": [{
				"value": 1,
				"class": "sbg:CPURequirement"
			}, {
				"value": 1000,
				"class": "sbg:MemRequirement"
			}, {
				"class": "DockerRequirement",
				"dockerPull": "ubuntu",
				"dockerImageId": ""
			}],
			"outputs": [{
				"outputBinding": {
					"glob": "*.txt"
				},
				"type": [
					"null",
					"File"
				],
				"id": "#result"
			}],
			"temporaryFailCodes": [],
			"requirements": [{
				"class": "ExpressionEngineRequirement",
				"requirements": [{
					"class": "DockerRequirement",
					"dockerPull": "rabix/js-engine"
				}],
				"id": "#cwl-js-engine"
			}],
			"description": "",
			"class": "CommandLineTool",
			"stdout": "text.txt",
			"inputs": [{
				"type": [
					"null",
					"File"
				],
				"id": "#inFile"
			}, {
				"type": [
					"null",
					"string"
				],
				"inputBinding": {
					"separate": true,
					"sbg:cmdInclude": true
				},
				"id": "#search"
			}],
			"baseCommand": [
				"grep"
			],
			"id": "https://api.sbgenomics.com/v2/apps/maya/test/io-tool/1/raw/",
			"arguments": []
		},
		"inputs": [{
			"id": "#io_tool.inFile",
			"source": [
				"#inFile"
			]
		}, {
			"id": "#io_tool.search"
		}],
		"outputs": [{
			"id": "#io_tool.result"
		}]
	}, {
		"id": "#io_tool_1",
		"run": {
			"label": "io-tool",
			"sbg:id": "maya/test/io-tool/1",
			"stdin": {
				"script": "$job.inputs.inFile.path",
				"class": "Expression",
				"engine": "#cwl-js-engine"
			},
			"cwlVersion": "sbg:draft-2",
			"successCodes": [],
			"hints": [{
				"value": 1,
				"class": "sbg:CPURequirement"
			}, {
				"value": 1000,
				"class": "sbg:MemRequirement"
			}, {
				"class": "DockerRequirement",
				"dockerPull": "ubuntu",
				"dockerImageId": ""
			}],
			"outputs": [{
				"outputBinding": {
					"glob": "*.txt"
				},
				"type": [
					"null",
					"File"
				],
				"id": "#result"
			}],
			"temporaryFailCodes": [],
			"requirements": [{
				"class": "ExpressionEngineRequirement",
				"requirements": [{
					"class": "DockerRequirement",
					"dockerPull": "rabix/js-engine"
				}],
				"id": "#cwl-js-engine"
			}],
			"description": "",
			"class": "CommandLineTool",
			"stdout": "text.txt",
			"inputs": [{
				"type": [
					"null",
					"File"
				],
				"id": "#inFile"
			}, {
				"type": [
					"null",
					"string"
				],
				"inputBinding": {
					"separate": true
				},
				"id": "#search"
			}],
			"baseCommand": [
				"grep"
			],
			"id": "https://api.sbgenomics.com/v2/apps/maya/test/io-tool/1/raw/",
			"arguments": []
		},
		"inputs": [{
			"id": "#io_tool_1.inFile",
			"source": [
				"#io_tool.result"
			]
		}, {
			"id": "#io_tool_1.search"
		}],
		"outputs": [{
			"id": "#io_tool_1.result"
		}]
	}],
	"requirements": [],
	"inputs": [{
		"label": "inFile",
		"id": "#inFile",
		"type": [
			"null",
			"File"
		]
	}],
	"outputs": [{
		"label": "result",
		"id": "#result",
		"type": [
			"null",
			"File"
		],
		"source": [
			"#io_tool_1.result"
		]
	}],
	"id": "maya/test/two-step-wf/0",
	"label": "two-step-wf",
	"description": "",
	"hints": []
}`);