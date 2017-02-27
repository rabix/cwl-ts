export default JSON.parse(`
{
	"cwlVersion": "sbg:draft-2",
	"hints": [],
	"outputs": [{
		"required": false,
		"type": [
			"null",
			"File"
		],
		"source": [
			"#basic_tool.fileOutput"
		],
		"sbg:y": 222,
		"sbg:x": 1273,
		"label": "fileOutput",
		"id": "#fileOutput"
	}],
	"steps": [{
		"run": {
			"label": "basic-tool",
			"sbg:id": "maya/test/basic-tool/2",
			"stdin": "",
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
				"dockerPull": "",
				"dockerImageId": ""
			}],
			"outputs": [{
				"type": [
					"null",
					"File"
				],
				"id": "#fileOutput"
			}],
			"id": "maya/test/basic-tool/2",
			"stdout": "",
			"temporaryFailCodes": [],
			"requirements": [],
			"class": "CommandLineTool",
			"inputs": [{
				"type": [
					"null",
					"int"
				],
				"inputBinding": {
					"separate": true,
					"sbg:cmdInclude": true
				},
				"id": "#toInclude"
			}, {
				"type": [
					"null",
					"string"
				],
				"inputBinding": {
					"separate": true,
					"sbg:cmdInclude": true
				},
				"id": "#toExpose"
			}, {
				"type": [
					"null", {
						"type": "array",
						"items": "string"
					}
				],
				"sbg:stageInput": null,
				"id": "#stringArr"
			}, {
				"required": true,
				"type": [
					"File"
				],
				"inputBinding": {
					"separate": true,
					"loadContents": false,
					"sbg:cmdInclude": true
				},
				"id": "#requiredFile"
			}, {
				"required": false,
				"type": [
					"null", {
						"type": "array",
						"items": "File"
					}
				],
				"sbg:stageInput": null,
				"id": "#fileArr"
			}, {
				"required": false,
				"type": [
					"null",
					"File"
				],
				"sbg:stageInput": null,
				"inputBinding": {
					"separate": true,
					"sbg:cmdInclude": true
				},
				"id": "#file"
			}, {
				"type": [
					"null",
					"string"
				],
				"id": "#default"
			}],
			"baseCommand": [
				"basic",
				"tool"
			],
			"description": "",
			"arguments": []
		},
		"outputs": [{
			"id": "#basic_tool.fileOutput"
		}],
		"sbg:y": 217,
		"sbg:x": 715,
		"inputs": [{
			"id": "#basic_tool.toInclude"
		}, {
			"id": "#basic_tool.toExpose"
		}, {
			"id": "#basic_tool.stringArr"
		}, {
			"id": "#basic_tool.requiredFile"
		}, {
			"id": "#basic_tool.fileArr"
		}, {
			"id": "#basic_tool.file"
		}, {
			"id": "#basic_tool.default"
		}],
		"id": "#basic_tool"
	}],
	"class": "Workflow",
	"requirements": [],
	"inputs": []
}`);